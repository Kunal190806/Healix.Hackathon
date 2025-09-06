
"use client";

import { useState, useEffect } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import type { VitalLog, Prescription } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, addDays } from "date-fns";
import { AlertTriangle, Bell, Calendar, Download, HeartPulse, Pill, User, Users, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { cn } from "@/lib/utils";

// Sample data to simulate a patient's profile
const samplePatient = {
  id: "P001",
  name: "Rohan Verma",
  age: 68,
  condition: "Hypertension & Type 2 Diabetes"
};

export default function CaregiverHub() {
  const [isLoading, setIsLoading] = useState(true);
  const [sampleAppointments, setSampleAppointments] = useState<any[]>([]);
  const [sampleVitals, setSampleVitals] = useState<VitalLog[]>([]);
  const [sampleMedications, setSampleMedications] = useState<Prescription[]>([]);
  const [sampleNotifications, setSampleNotifications] = useState<any[]>([]);
  const [adherenceData, setAdherenceData] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date();
    setSampleAppointments([
      { id: 'app1', doctor: "Dr. Priya Sharma", specialty: "Cardiologist", date: addDays(today, 3).toISOString(), time: "11:00 AM" },
      { id: 'app2', doctor: "Dr. Amit Joshi", specialty: "Endocrinologist", date: addDays(today, 15).toISOString(), time: "02:30 PM" },
    ]);
    setSampleVitals([
        { id: 'v1', date: subDays(today, 4).toISOString(), bloodPressure: { systolic: 145, diastolic: 92 } },
        { id: 'v2', date: subDays(today, 3).toISOString(), bloodSugar: 160 },
        { id: 'v3', date: subDays(today, 2).toISOString(), heartRate: 88 },
        { id: 'v4', date: subDays(today, 1).toISOString(), bloodPressure: { systolic: 142, diastolic: 90 }, bloodSugar: 155 },
    ]);
    setSampleMedications([
        { id: 'p1', name: 'Lisinopril', dosage: '10mg', frequency: 'Once a day', time: 'Morning' },
        { id: 'p2', name: 'Metformin', dosage: '500mg', frequency: 'Twice a day', time: 'Morning, Evening' },
    ]);
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

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("HEALIX Health Summary", pageWidth / 2, 25, { align: "center" });

    // 2. Patient Information
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Patient Name: ${samplePatient.name}`, 15, 45);
    doc.text(`Patient ID: ${samplePatient.id}`, 15, 51);
    doc.text(`Export Date: ${format(new Date(), 'PPpp')}`, pageWidth - 15, 45, {align: 'right'});


    // 3. Appointments Table
    autoTable(doc, {
        startY: 60,
        head: [['Date & Time', 'Doctor', 'Specialty']],
        body: sampleAppointments.map(a => [
            `${format(new Date(a.date), "PP")} at ${a.time}`,
            a.doctor,
            a.specialty
        ]),
        headStyles: { fillColor: [63, 81, 181] },
        didDrawPage: (data) => addFooter(doc, data.pageNumber)
    });

    // 4. Vitals Table
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
        didDrawPage: (data) => addFooter(doc, data.pageNumber)
    });
    
     // 5. Adherence Table
    autoTable(doc, {
        head: [['Medication', 'Dosage', 'Frequency', 'Time']],
        body: sampleMedications.map(m => [m.name, m.dosage, m.frequency, m.time || 'N/A']),
         headStyles: { fillColor: [63, 81, 181] },
        didDrawPage: (data) => addFooter(doc, data.pageNumber)
    });

    doc.save(`HEALIX_Summary_${samplePatient.name}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };
  
  const addFooter = (doc: jsPDF, pageNumber: number) => {
    const pageCount = doc.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`© ${new Date().getFullYear()} HEALIX. All rights reserved. | support@healix.io`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(`Page ${pageNumber} of ${pageCount}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
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
            data: sampleAppointments.map(a => [format(new Date(a.date), 'yyyy-MM-dd'), a.time, a.doctor, a.specialty])
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
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `HEALIX_Summary_${samplePatient.name}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const handleDownload = () => {
    generatePDF();
    generateCSV();
  }

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
                            <Tooltip
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
                            {sampleAppointments.map(a => (
                                <TableRow key={a.id}>
                                    <TableCell>{format(new Date(a.date), "EEE, MMM d")} at {a.time}</TableCell>
                                    <TableCell>{a.doctor}</TableCell>
                                    <TableCell>{a.specialty}</TableCell>
                                </TableRow>
                            ))}
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
                           {sampleVitals.map(v => (
                            Object.entries(v).map(([key, value]) => {
                                if (key === 'id' || key === 'date' || !value) return null;
                                let displayValue: string;
                                let metricName: string;
                                
                                switch(key) {
                                    case 'bloodPressure':
                                        displayValue = `${value.systolic}/${value.diastolic} mmHg`;
                                        metricName = 'Blood Pressure';
                                        break;
                                    case 'bloodSugar':
                                        displayValue = `${value} mg/dL`;
                                        metricName = 'Blood Sugar';
                                        break;
                                    case 'heartRate':
                                        displayValue = `${value} BPM`;
                                        metricName = 'Heart Rate';
                                        break;
                                    default:
                                        displayValue = String(value);
                                        metricName = key;
                                }

                                return (
                                <TableRow key={`${v.id}-${key}`}>
                                    <TableCell>{metricName}</TableCell>
                                    <TableCell className="font-mono">{displayValue}</TableCell>
                                    <TableCell>{format(new Date(v.date), 'PP')}</TableCell>
                                </TableRow>
                                );
                            })
                           )).flat().filter(Boolean)}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
