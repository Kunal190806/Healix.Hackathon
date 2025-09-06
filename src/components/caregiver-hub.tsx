
"use client";

import { useState } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import type { VitalLog, Prescription } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, addDays } from "date-fns";
import { AlertTriangle, Bell, Calendar, Download, HeartPulse, Pill, User, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Sample data to simulate a patient's profile
const samplePatient = {
  name: "Rohan Verma",
  age: 68,
  condition: "Hypertension & Type 2 Diabetes"
};

const sampleAppointments = [
  { id: 'app1', doctor: "Dr. Priya Sharma", specialty: "Cardiologist", date: addDays(new Date(), 3).toISOString(), time: "11:00 AM" },
  { id: 'app2', doctor: "Dr. Amit Joshi", specialty: "Endocrinologist", date: addDays(new Date(), 15).toISOString(), time: "02:30 PM" },
];

const sampleVitals: VitalLog[] = [
    { id: 'v1', date: subDays(new Date(), 4).toISOString(), bloodPressure: { systolic: 145, diastolic: 92 } },
    { id: 'v2', date: subDays(new  Date(), 3).toISOString(), bloodSugar: 160 },
    { id: 'v3', date: subDays(new Date(), 2).toISOString(), heartRate: 88 },
    { id: 'v4', date: subDays(new Date(), 1).toISOString(), bloodPressure: { systolic: 142, diastolic: 90 }, bloodSugar: 155 },
];

const sampleMedications: Prescription[] = [
    { id: 'p1', name: 'Lisinopril', dosage: '10mg', frequency: 'Once a day', time: 'Morning' },
    { id: 'p2', name: 'Metformin', dosage: '500mg', frequency: 'Twice a day', time: 'Morning, Evening' },
];

const sampleNotifications = [
    { id: 'n1', type: 'Missed Medication', message: 'Rohan missed his evening dose of Metformin.', date: subDays(new Date(), 1).toISOString(), severity: 'high' },
    { id: 'n2', type: 'Abnormal Vital', message: 'Blood Pressure reading was high: 145/92 mmHg.', date: subDays(new Date(), 4).toISOString(), severity: 'high' },
    { id: 'n3', type: 'Appointment Reminder', message: 'Cardiologist appointment in 3 days.', date: new Date().toISOString(), severity: 'medium' },
    { id: 'n4', type: 'Low Adherence', message: 'Medication adherence dropped to 75% this week.', date: new Date().toISOString(), severity: 'medium' },
];

const adherenceData = [
  { date: format(subDays(new Date(), 6), 'EEE'), taken: 3, total: 4 },
  { date: format(subDays(new Date(), 5), 'EEE'), taken: 4, total: 4 },
  { date: format(subDays(new Date(), 4), 'EEE'), taken: 4, total: 4 },
  { date: format(subDays(new Date(), 3), 'EEE'), taken: 3, total: 4 },
  { date: format(subDays(new Date(), 2), 'EEE'), taken: 4, total: 4 },
  { date: format(subDays(new Date(), 1), 'EEE'), taken: 3, total: 4 },
  { date: format(new Date(), 'EEE'), taken: 1, total: 2 }, // Today
].map(d => ({ ...d, adherence: (d.taken / d.total) * 100 }));


export default function CaregiverHub() {

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
                <Button><Download className="mr-2 h-4 w-4" /> Download Summary</Button>
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
