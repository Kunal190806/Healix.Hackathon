
"use client";

import { useState, useEffect } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import type { VitalLog, Prescription, HearingResult, HearingTestRecord, EyeTestResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend, ReferenceLine } from 'recharts';
import { format, subDays, addDays } from "date-fns";
import { AlertTriangle, Bell, Calendar, Download, HeartPulse, Pill, User, Loader2, Ear, Eye, Info } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Sample data to simulate a patient's profile
const samplePatient = {
  id: "P001",
  name: "Rohan Verma",
  age: 68,
  condition: "Hypertension & Type 2 Diabetes"
};

const normalHearingThreshold = 25;

export default function CaregiverHub() {
  const [isLoading, setIsLoading] = useState(true);
  const [sampleAppointments] = useLocalStorage<any[]>('appointments', []);
  const [sampleVitals] = useLocalStorage<VitalLog[]>('vitalLogs', []);
  const [sampleMedications] = useLocalStorage<Prescription[]>('prescriptions', []);
  const [hearingTestHistory] = useLocalStorage<HearingTestRecord[]>('hearingTestHistory', []);
  const [eyeTestHistory] = useLocalStorage<EyeTestResult[]>('eyeTestHistory', []);
  
  const [sampleNotifications, setSampleNotifications] = useState<any[]>([]);
  const [adherenceData, setAdherenceData] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date();
    // These are now driven by localStorage, but we can keep notifications and adherence as sample data.
    setSampleNotifications([
        { id: 'n1', type: 'Missed Medication', message: 'Rohan missed his evening dose of Metformin.', date: subDays(today, 1).toISOString(), severity: 'high' },
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

    const timer = setTimeout(() => setIsLoading(false), 500); // Simulate loading
    return () => clearTimeout(timer);
  }, []);

  const latestHearingTest = hearingTestHistory?.[0];
  const latestEyeTest = eyeTestHistory?.[0];

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let finalY = 0;

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("HEALIX Health Summary", pageWidth / 2, 25, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Patient Name: ${samplePatient.name}`, 15, 45);
    doc.text(`Patient ID: ${samplePatient.id}`, 15, 51);
    doc.text(`Export Date: ${format(new Date(), 'PPpp')}`, pageWidth - 15, 45, {align: 'right'});

    autoTable(doc, {
        startY: 60,
        head: [['Date & Time', 'Doctor', 'Specialty']],
        body: sampleAppointments.map(a => [
            `${format(new Date(a.date), "PP")} at ${a.time}`,
            a.doctorName,
            a.specialty
        ]),
        headStyles: { fillColor: [63, 81, 181] },
        didDrawPage: (data) => { finalY = data.cursor?.y ?? 0; }
    });
    
    if (latestEyeTest) {
        autoTable(doc, {
            head: [['Vision Test Date', 'Score', 'Interpretation']],
            body: [[format(new Date(latestEyeTest.date), 'PP'), latestEyeTest.score, latestEyeTest.interpretation]],
            headStyles: { fillColor: [63, 81, 181] },
            didDrawPage: (data) => { finalY = data.cursor?.y ?? 0; }
        });
    }
    
    if (latestHearingTest) {
        const testFrequencies = [250, 500, 1000, 2000, 4000, 8000];
        const formatResults = (ear: 'left' | 'right') => 
          testFrequencies.map(freq => {
            const result = latestHearingTest.results.find(r => r.ear === ear && r.frequency === freq);
            return [freq + " Hz", result?.decibel !== null && result?.decibel !== undefined ? `${result?.decibel} dBHL` : '> 120 dBHL'];
          });
        autoTable(doc, {
            head: [[`Hearing Test (${format(new Date(latestHearingTest.date), 'PP')})`, 'Right Ear', 'Left Ear']],
            body: testFrequencies.map((freq, index) => {
                const right = formatResults('right')[index][1];
                const left = formatResults('left')[index][1];
                return [`${freq} Hz`, right, left];
            }),
            headStyles: { fillColor: [63, 81, 181] },
            didDrawPage: (data) => { finalY = data.cursor?.y ?? 0; }
        });
    }

    autoTable(doc, {
        head: [['Date', 'Metric', 'Value']],
        body: sampleVitals.flatMap(v => {
            const entries: [string, string, string][] = [];
            const d = format(new Date(v.date), 'PP');
            if (v.bloodPressure) entries.push([d, 'Blood Pressure', `${v.bloodPressure.systolic}/${v.bloodPressure.diastolic} mmHg`]);
            if (v.bloodSugar) entries.push([d, 'Blood Sugar', `${v.bloodSugar} mg/dL`]);
            if (v.heartRate) entries.push([d, 'Heart Rate', `${v.heartRate} BPM`]);
            return entries;
        }),
        headStyles: { fillColor: [63, 81, 181] },
        didDrawPage: (data) => { finalY = data.cursor?.y ?? 0; }
    });
    
    autoTable(doc, {
        head: [['Medication', 'Dosage', 'Frequency', 'Time']],
        body: sampleMedications.map(m => [m.name, m.dosage, m.frequency, m.time || 'N/A']),
        headStyles: { fillColor: [63, 81, 181] },
        didDrawPage: (data) => { finalY = data.cursor?.y ?? 0; }
    });

    doc.save(`HEALIX_Summary_${samplePatient.name}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };
  
  const generateCSV = () => {
    const headers = [
        `HEALIX Health Summary`,
        `Patient ID: ${samplePatient.id}`,
        `Patient Name: ${samplePatient.name}`,
        `Export Date: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`
    ];

    const sections: {title: string, columns: string[], data: string[][]}[] = [
        {
            title: "Upcoming Appointments",
            columns: ["Date", "Time", "Doctor", "Specialty"],
            data: sampleAppointments.map(a => [format(new Date(a.date), 'yyyy-MM-dd'), a.time, a.doctorName, a.specialty])
        },
        {
            title: "Vital Signs Log",
            columns: ["Date", "Blood Pressure (Systolic)", "Blood Pressure (Diastolic)", "Blood Sugar (mg/dL)", "Heart Rate (BPM)"],
            data: sampleVitals.map(v => [
                format(new Date(v.date), 'yyyy-MM-dd HH:mm'),
                v.bloodPressure?.systolic.toString() ?? '',
                v.bloodPressure?.diastolic.toString() ?? '',
                v.bloodSugar?.toString() ?? '',
                v.heartRate?.toString() ?? ''
            ])
        },
        {
            title: "Medication Adherence",
            columns: ["Date", "Adherence (%)"],
            data: adherenceData.map(d => [d.date, d.adherence.toFixed(2)])
        }
    ];

    if (latestEyeTest) {
        sections.push({
            title: "Vision Test Results",
            columns: ["Date", "Score", "Interpretation"],
            data: [[format(new Date(latestEyeTest.date), 'yyyy-MM-dd'), latestEyeTest.score, `"${latestEyeTest.interpretation.replace(/"/g, '""')}"`]]
        });
    }
    
    if (latestHearingTest) {
        sections.push({
            title: "Hearing Test Results",
            columns: ["Date", "Ear", "Frequency (Hz)", "Threshold (dBHL)"],
            data: latestHearingTest.results.map(r => [
                format(new Date(latestHearingTest.date), 'yyyy-MM-dd'),
                r.ear,
                r.frequency.toString(),
                r.decibel?.toString() ?? '>120'
            ])
        });
    }

    let csvContent = headers.join("\n") + "\n\n";
    sections.forEach(section => {
        csvContent += section.title + "\n";
        csvContent += section.columns.join(",") + "\n";
        section.data.forEach(row => {
            csvContent += row.join(",") + "\n";
        });
        csvContent += "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `HEALIX_Summary_${samplePatient.name}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
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

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-6 w-6 text-primary"/>
                        <span>Patient: {samplePatient.name}</span>
                    </CardTitle>
                    <CardDescription>{samplePatient.age} years old - {samplePatient.condition}</CardDescription>
                </div>
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" /> Download Summary
                </Button>
            </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5"/> Recent Notifications</CardTitle>
                    <CardDescription>Key alerts for Rohan's health.</CardDescription>
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
                    <CardTitle className="flex items-center gap-2"><Pill className="h-5 w-5"/> Medication Adherence (Last 7 Days)</CardTitle>
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
                            {sampleAppointments && sampleAppointments.filter(a => new Date(a.date) >= new Date() && a.status === 'Confirmed').length > 0 ? (
                                sampleAppointments.filter(a => new Date(a.date) >= new Date() && a.status === 'Confirmed').map(a => (
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
                           {sampleVitals && sampleVitals.length > 0 ? (
                            sampleVitals.slice(0, 5).flatMap(v => {
                                const entries: {metric: string; value: string}[] = [];
                                if (v.bloodPressure) entries.push({metric: 'Blood Pressure', value: `${v.bloodPressure.systolic}/${v.bloodPressure.diastolic} mmHg`});
                                if (v.bloodSugar) entries.push({metric: 'Blood Sugar', value: `${v.bloodSugar} mg/dL`});
                                if (v.heartRate) entries.push({metric: 'Heart Rate', value: `${v.heartRate} BPM`});
                                
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
