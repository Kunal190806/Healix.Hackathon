
"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, orderBy, doc, getDocs, updateDoc, writeBatch } from "firebase/firestore";
import type { User } from "firebase/auth";
import type { UserProfile, VitalLog, Prescription, HearingTestRecord, EyeTestResult, ResponseTimeResult, Appointment as Appt } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend, ReferenceLine } from 'recharts';
import { format, subDays, addDays } from "date-fns";
import { AlertTriangle, Bell, Calendar, Download, HeartPulse, Pill, User, Loader2, Ear, Eye, Timer, Link, ShieldCheck } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth.tsx";
import { useProfile } from "@/hooks/use-profile.tsx";


const normalHearingThreshold = 25;

function LinkPatientForm({ caregiverId }: { caregiverId: string }) {
    const [patientEmail, setPatientEmail] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [isLinking, setIsLinking] = useState(false);
    const { toast } = useToast();

    const handleLinkPatient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientEmail || !accessCode) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please enter both patient email and access code.' });
            return;
        }
        setIsLinking(true);

        try {
            // Find patient by email
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", patientEmail), where("role", "==", "patient"));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error("No patient found with that email address.");
            }

            const patientDoc = querySnapshot.docs[0];
            const patientData = patientDoc.data() as UserProfile;

            // Verify access code
            if (!patientData.accessCode || patientData.accessCode !== accessCode) {
                throw new Error("The access code is incorrect.");
            }
            if (!patientData.accessCodeExpires || new Date() > new Date(patientData.accessCodeExpires)) {
                throw new Error("The access code has expired. Please ask the patient to generate a new one.");
            }

            // Link successful, update both profiles in a batch
            const batch = writeBatch(db);
            const caregiverRef = doc(db, "users", caregiverId);
            batch.update(caregiverRef, { monitoringPatientId: patientData.uid });
            
            const patientRef = doc(db, "users", patientData.uid);
            batch.update(patientRef, { accessCode: null, accessCodeExpires: null });

            await batch.commit();

            toast({ title: 'Success!', description: `You are now monitoring ${patientData.name}.` });

        } catch (error: any) {
            console.error("Failed to link patient:", error);
            toast({ variant: 'destructive', title: 'Linking Failed', description: error.message || 'An unknown error occurred.' });
        } finally {
            setIsLinking(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Link className="h-5 w-5" /> Link to a Patient</CardTitle>
                <CardDescription>Enter the patient's email and the 4-digit code they shared with you.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLinkPatient} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="patient-email">Patient's Email</Label>
                        <Input id="patient-email" type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} placeholder="patient@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="access-code">4-Digit Access Code</Label>
                        <Input id="access-code" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder="1234" required maxLength={4} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLinking}>
                        {isLinking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                        Link and Monitor
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function CaregiverHub() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { userProfile, isLoading: isProfileLoading } = useProfile();
  const [patientProfile, setPatientProfile] = useState<UserProfile | null>(null);
  
  const [appointments, setAppointments] = useState<Appt[]>([]);
  const [vitals, setVitals] = useState<VitalLog[]>([]);
  const [medications, setMedications] = useState<Prescription[]>([]);
  const [hearingTestHistory, setHearingTestHistory] = useState<HearingTestRecord[]>([]);
  const [eyeTestHistory, setEyeTestHistory] = useState<EyeTestResult[]>([]);
  const [responseTimeHistory, setResponseTimeHistory] = useState<ResponseTimeResult[]>([]);
  
  const [sampleNotifications, setSampleNotifications] = useState<any[]>([]);
  const [adherenceData, setAdherenceData] = useState<any[]>([]);

  const isLoading = isAuthLoading || isProfileLoading;

  useEffect(() => {
    if (isLoading || !userProfile) {
        return;
    }
    if (userProfile?.role === 'caregiver' && userProfile.monitoringPatientId) {
        const patientId = userProfile.monitoringPatientId;
        
        // Subscribe to patient's profile
        const unsubPatientProfile = onSnapshot(doc(db, 'users', patientId), (doc) => {
            setPatientProfile(doc.data() as UserProfile);
        });

        // Fetch all patient data
        const collectionsToFetch = [
          { name: "appointments", setter: setAppointments },
          { name: "vitals", setter: setVitals },
          { name: "prescriptions", setter: setMedications },
          { name: "hearingTestHistory", setter: setHearingTestHistory },
          { name: "eyeTestHistory", setter: setEyeTestHistory },
          { name: "responseTimeHistory", setter: setResponseTimeHistory },
        ];

        const unsubscribers = collectionsToFetch.map(({ name, setter }) => {
          const q = query(collection(db, name), where("userId", "==", patientId), orderBy("date", "desc"));
          return onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setter(data as any);
          });
        });
        
        // Mock data for notifications and adherence as they are not stored in DB
        const today = new Date();
        setSampleNotifications([
            { id: 'n1', type: 'Missed Medication', message: `Patient missed evening dose of Metformin.`, date: subDays(today, 1).toISOString(), severity: 'high' },
            { id: 'n2', type: 'Abnormal Vital', message: 'Blood Pressure reading was high: 145/92 mmHg.', date: subDays(today, 4).toISOString(), severity: 'high' },
            { id: 'n3', type: 'Appointment Reminder', message: 'Cardiologist appointment in 3 days.', date: today.toISOString(), severity: 'medium' },
            { id: 'n4', type: 'Low Adherence', message: 'Medication adherence dropped to 75% this week.', date: today.toISOString(), severity: 'medium' },
        ]);
        setAdherenceData([
          { date: format(subDays(today, 6), 'EEE'), taken: 3, total: 4 },
          { date: format(subDays(today, 5), 'EEE'), taken: 4, total: 4 },
          { date: format(subDays(today, 4), 'EEE'), taken: 4, total: 4 },
          { date: format(subDays(today, 3), 'EEE'), taken: 3, total: 4 },
          { date: format(subDays(today, 2), 'EEE'), taken: 4, total: 4 },
          { date: format(subDays(today, 1), 'EEE'), taken: 3, total: 4 },
          { date: format(today, 'EEE'), taken: 1, total: 2 }, // Today
        ].map(d => ({ ...d, adherence: (d.taken / d.total) * 100 })));

        return () => {
            unsubPatientProfile();
            unsubscribers.forEach(unsub => unsub());
        };
      } else {
        // Clear all data if not monitoring
        setPatientProfile(null);
        setAppointments([]);
        setVitals([]);
        setMedications([]);
        setHearingTestHistory([]);
        setEyeTestHistory([]);
        setResponseTimeHistory([]);
      }
  }, [userProfile, isLoading]);

  const latestHearingTest = hearingTestHistory?.[0];
  const latestEyeTest = eyeTestHistory?.[0];
  const latestResponseTimeTest = responseTimeHistory?.[0];
  const patientDisplayName = patientProfile ? patientProfile.name : "Patient";

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let finalY = 0;

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("HEALIX Health Summary", pageWidth / 2, 25, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Patient Name: ${patientDisplayName}`, 15, 45);
    doc.text(`Patient ID: ${patientProfile?.uid.slice(0, 10) || "N/A"}`, 15, 51);
    doc.text(`Export Date: ${format(new Date(), 'PPpp')}`, pageWidth - 15, 45, {align: 'right'});
    
    // Appointments
    if (appointments.length > 0) {
      autoTable(doc, {
          startY: 60,
          head: [['Upcoming Appointments']],
          body: appointments
            .filter(a => new Date(a.date) >= new Date() && a.status === 'Confirmed')
            .map(a => [`${format(new Date(a.date), "PP")} at ${a.time} with ${a.doctorName} (${a.specialty})`]),
          headStyles: { fillColor: [63, 81, 181] },
          didDrawPage: (data) => { finalY = data.cursor?.y ?? 0; }
      });
    }

    // Eye Test
    if (latestEyeTest) {
        autoTable(doc, {
            head: [['Vision Test Date', 'Score', 'Interpretation']],
            body: [[format(new Date(latestEyeTest.date), 'PP'), latestEyeTest.score, latestEyeTest.interpretation]],
            headStyles: { fillColor: [63, 81, 181] },
            didDrawPage: (data) => { finalY = data.cursor?.y ?? 0; }
        });
    }

    // Response Time Test
    if (latestResponseTimeTest) {
        autoTable(doc, {
            head: [['Response Test Date', 'Average', 'Scores']],
            body: [[format(new Date(latestResponseTimeTest.date), 'PP'), `${Math.round(latestResponseTimeTest.average)} ms`, latestResponseTimeTest.scores.join(', ')+' ms']],
            headStyles: { fillColor: [63, 81, 181] },
            didDrawPage: (data) => { finalY = data.cursor?.y ?? 0; }
        });
    }
    
    // Hearing Test
    if (latestHearingTest) {
        const testFrequencies = [250, 500, 1000, 2000, 4000, 8000];
        autoTable(doc, {
            head: [[`Hearing Test (${format(new Date(latestHearingTest.date), 'PP')})`, 'Right Ear', 'Left Ear']],
            body: testFrequencies.map((freq) => {
                const right = latestHearingTest.results.find(r => r.ear === 'right' && r.frequency === freq);
                const left = latestHearingTest.results.find(r => r.ear === 'left' && r.frequency === freq);
                return [
                    `${freq} Hz`,
                    right?.decibel !== null && right?.decibel !== undefined ? `${right.decibel} dBHL` : '> 120 dBHL',
                    left?.decibel !== null && left?.decibel !== undefined ? `${left.decibel} dBHL` : '> 120 dBHL'
                ];
            }),
            headStyles: { fillColor: [63, 81, 181] },
            didDrawPage: (data) => { finalY = data.cursor?.y ?? 0; }
        });
    }

    // Vitals
    if(vitals.length > 0) {
      autoTable(doc, {
          head: [['Date', 'Metric', 'Value']],
          body: vitals.slice(0, 10).flatMap(v => {
              const entries: [string, string, string][] = [];
              const d = format(new Date(v.date), 'PP');
              if (v.bloodPressure) entries.push([d, 'Blood Pressure', `${v.bloodPressure.systolic}/${v.bloodPressure.diastolic} mmHg`]);
              if (v.bloodSugar) entries.push([d, 'Blood Sugar', `${v.bloodSugar} mg/dL`]);
              if (v.heartRate) entries.push([d, 'Heart Rate', `${v.heartRate} BPM`]);
              if (v.weight) entries.push([d, 'Weight', `${v.weight} kg`]);
              return entries;
          }),
          headStyles: { fillColor: [63, 81, 181] },
          didDrawPage: (data) => { finalY = data.cursor?.y ?? 0; }
      });
    }
    
    // Medications
    if(medications.length > 0) {
      autoTable(doc, {
          head: [['Medication', 'Dosage', 'Frequency', 'Time']],
          body: medications.map(m => [m.name, m.dosage, m.frequency, m.time || 'N/A']),
          headStyles: { fillColor: [63, 81, 181] },
          didDrawPage: (data) => { finalY = data.cursor?.y ?? 0; }
      });
    }

    doc.save(`HEALIX_Summary_${patientDisplayName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };
  
  const generateCSV = () => {
    let csvContent = `HEALIX Health Summary\nPatient Name: ${patientDisplayName}\nExport Date: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n\n`;

    const sections: {title: string, columns: string[], data: string[][]}[] = [];
    
    if (appointments.length > 0) sections.push({
        title: "Upcoming Appointments",
        columns: ["Date", "Time", "Doctor", "Specialty"],
        data: appointments.filter(a => new Date(a.date) >= new Date() && a.status === 'Confirmed').map(a => [format(new Date(a.date), 'yyyy-MM-dd'), a.time, a.doctorName, a.specialty])
    });

    if (vitals.length > 0) sections.push({
        title: "Vital Signs Log",
        columns: ["Date", "Blood Pressure (Systolic)", "Blood Pressure (Diastolic)", "Blood Sugar (mg/dL)", "Heart Rate (BPM)", "Weight (kg)"],
        data: vitals.map(v => [
            format(new Date(v.date), 'yyyy-MM-dd HH:mm'),
            v.bloodPressure?.systolic.toString() ?? '',
            v.bloodPressure?.diastolic.toString() ?? '',
            v.bloodSugar?.toString() ?? '',
            v.heartRate?.toString() ?? '',
            v.weight?.toString() ?? ''
        ])
    });
    
    if (adherenceData.length > 0) sections.push({
        title: "Medication Adherence (Sample)",
        columns: ["Date", "Adherence (%)"],
        data: adherenceData.map(d => [d.date, d.adherence.toFixed(2)])
    });

    if (latestEyeTest) sections.push({
        title: "Vision Test Results",
        columns: ["Date", "Score", "Interpretation"],
        data: [[format(new Date(latestEyeTest.date), 'yyyy-MM-dd'), latestEyeTest.score, `"${latestEyeTest.interpretation.replace(/"/g, '""')}"`]]
    });

    if (latestResponseTimeTest) sections.push({
        title: "Response Time Test Results",
        columns: ["Date", "Average (ms)", "Scores (ms)"],
        data: [[format(new Date(latestResponseTimeTest.date), 'yyyy-MM-dd'), Math.round(latestResponseTimeTest.average).toString(), `"${latestResponseTimeTest.scores.join(', ')}"`]]
    });
    
    if (latestHearingTest) sections.push({
        title: "Hearing Test Results",
        columns: ["Date", "Ear", "Frequency (Hz)", "Threshold (dBHL)"],
        data: latestHearingTest.results.map(r => [
            format(new Date(latestHearingTest.date), 'yyyy-MM-dd'),
            r.ear,
            r.frequency.toString(),
            r.decibel?.toString() ?? '>120'
        ])
    });

    sections.forEach(section => {
        csvContent += section.title + "\n";
        csvContent += section.columns.join(",") + "\n";
        section.data.forEach(row => { csvContent += row.join(",") + "\n"; });
        csvContent += "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `HEALIX_Summary_${patientDisplayName}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = () => {
    generatePDF();
    generateCSV();
  }
  
  const hearingChartData = [250, 500, 1000, 2000, 4000, 8000].map(freq => {
    const leftResult = latestHearingTest?.results.find(r => r.ear === 'left' && r.frequency === freq);
    const rightResult = latestHearingTest?.results.find(r => r.ear === 'right' && r.frequency === freq);
    return {
      frequency: freq,
      left: leftResult?.decibel,
      right: rightResult?.decibel,
    };
  });


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-4 text-muted-foreground">Loading Caregiver Hub...</span>
      </div>
    );
  }
  
  if (!user || !userProfile) {
    return (
        <Card className="text-center p-8">
            <CardTitle>Please Log In</CardTitle>
            <CardDescription>You need to be logged in to access the Caregiver Hub.</CardDescription>
        </Card>
    );
  }

  if (userProfile.role !== 'caregiver') {
     return (
        <Card className="text-center p-8">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>This page is for caregivers only.</CardDescription>
        </Card>
    );
  }
  
  if (!userProfile.monitoringPatientId) {
    return <LinkPatientForm caregiverId={user.uid} />;
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-6 w-6 text-primary"/>
                        <span>Monitoring: {patientDisplayName}</span>
                    </CardTitle>
                    {patientProfile && <CardDescription>Managing profile for {patientProfile.email}</CardDescription>}
                </div>
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" /> Download Summary
                </Button>
            </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5"/> Recent Notifications (Sample)</CardTitle>
                    <CardDescription>Key alerts for {patientDisplayName}'s health.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {sampleNotifications.map(n => (
                        <div key={n.id} className="flex items-start gap-3">
                            <div className="mt-1">
                                <AlertTriangle className={`h-5 w-5 ${n.severity === 'high' ? 'text-destructive' : 'text-yellow-500'}`} />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{n.type}</p>
                                <p className="text-xs text-muted-foreground">{n.message}</p>
                                <p className="text-xs text-muted-foreground/70">{format(new Date(n.date), 'PP p')}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Pill className="h-5 w-5"/> Medication Adherence (Sample)</CardTitle>
                    <CardDescription>Percentage of doses taken on time.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={adherenceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={12} />
                            <YAxis domain={[0, 100]} unit="%" fontSize={12} />
                            <RechartsTooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))'
                                }}
                                cursor={{ fill: 'hsl(var(--accent))', opacity: 0.5 }}
                            />
                            <Bar dataKey="adherence" name="Adherence" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {latestEyeTest && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" /> Latest Vision Test</CardTitle>
                        <CardDescription>Taken on {format(new Date(latestEyeTest.date), 'PP')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4 text-center">
                        <div className="p-6 rounded-lg bg-muted/50 w-full">
                            <p className="text-sm text-muted-foreground">Estimated Score</p>
                            <p className="text-5xl font-bold text-primary">{latestEyeTest.score}</p>
                        </div>
                        <p className="text-sm max-w-prose">{latestEyeTest.interpretation}</p>
                    </CardContent>
                </Card>
            )}
             {latestResponseTimeTest && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Timer className="h-5 w-5" /> Latest Cognitive Response Test</CardTitle>
                        <CardDescription>Taken on {format(new Date(latestResponseTimeTest.date), 'PP')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4 text-center">
                        <div className="p-6 rounded-lg bg-muted/50 w-full">
                            <p className="text-sm text-muted-foreground">Average Response Time</p>
                            <p className="text-5xl font-bold font-mono text-primary">{Math.round(latestResponseTimeTest.average)}<span className="text-2xl ml-2">ms</span></p>
                        </div>
                        <p className="text-sm max-w-prose">A lower score is better. Average response time for most people is 200-300ms.</p>
                    </CardContent>
                </Card>
            )}
            {latestHearingTest && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Ear className="h-5 w-5" /> Latest Hearing Test</CardTitle>
                         <CardDescription>Taken on {format(new Date(latestHearingTest.date), 'PP')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={hearingChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="frequency" type="category" allowDuplicatedCategory={false} />
                                <YAxis reversed domain={[-10, 120]} />
                                <RechartsTooltip 
                                  formatter={(value: number | null) => value === null ? '>120 dBHL' : `${value} dBHL`}
                                  contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))'
                                  }}
                                />
                                <Legend />
                                <ReferenceLine y={normalHearingThreshold} label={{value: "Normal", position: "insideTopLeft", fill: 'hsl(var(--muted-foreground))', fontSize: 10}} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
                                <Line type="monotone" dataKey="right" name="Right" stroke="hsl(var(--destructive))" strokeWidth={2} connectNulls />
                                <Line type="monotone" dataKey="left" name="Left" stroke="hsl(var(--ring))" strokeWidth={2} connectNulls/>
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5"/> Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Doctor</TableHead>
                                <TableHead>Specialty</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appointments && appointments.filter(a => new Date(a.date) >= new Date() && a.status === 'Confirmed').length > 0 ? (
                                appointments.filter(a => new Date(a.date) >= new Date() && a.status === 'Confirmed').map(a => (
                                <TableRow key={a.id}>
                                    <TableCell>{format(new Date(a.date), "EEE, MMM d")} at {a.time}</TableCell>
                                    <TableCell>{a.doctorName}</TableCell>
                                    <TableCell>{a.specialty}</TableCell>
                                </TableRow>
                            ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No upcoming appointments.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5"/> Latest Vitals</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Metric</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {vitals && vitals.length > 0 ? (
                            vitals.slice(0, 5).flatMap(v => {
                                const entries: {metric: string; value: string}[] = [];
                                if (v.bloodPressure) entries.push({metric: 'Blood Pressure', value: `${v.bloodPressure.systolic}/${v.bloodPressure.diastolic} mmHg`});
                                if (v.bloodSugar) entries.push({metric: 'Blood Sugar', value: `${v.bloodSugar} mg/dL`});
                                if (v.heartRate) entries.push({metric: 'Heart Rate', value: `${v.heartRate} BPM`});
                                if (v.weight) entries.push({metric: 'Weight', value: `${v.weight} kg`});
                                
                                return entries.map(entry => (
                                     <TableRow key={`${v.id}-${entry.metric}`}>
                                        <TableCell>{entry.metric}</TableCell>
                                        <TableCell className="font-mono">{entry.value}</TableCell>
                                        <TableCell>{format(new Date(v.date), 'PP')}</TableCell>
                                    </TableRow>
                                ));
                           })
                           ) : (
                               <TableRow>
                                   <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No vitals logged yet.</TableCell>
                               </TableRow>
                           )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

    