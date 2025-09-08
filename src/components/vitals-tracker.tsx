
"use client";

import { useState } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import type { VitalLog } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { HeartPulse, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });

export default function VitalsTracker() {
  const [logs, setLogs] = useLocalStorage<VitalLog[]>("vitalLogs", []);
  
  // Form state for all vitals
  const [bloodPressure, setBloodPressure] = useState({ systolic: "", diastolic: "" });
  const [bloodSugar, setBloodSugar] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  
  const [chartMetric, setChartMetric] = useState<keyof Omit<VitalLog, 'id' | 'date' | 'notes'>>('heartRate');


  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: VitalLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      bloodPressure: bloodPressure.systolic && bloodPressure.diastolic ? {systolic: Number(bloodPressure.systolic), diastolic: Number(bloodPressure.diastolic)} : undefined,
      bloodSugar: bloodSugar ? Number(bloodSugar) : undefined,
      heartRate: heartRate ? Number(heartRate) : undefined,
      weight: weight ? Number(weight) : undefined,
      notes: notes,
    };
    setLogs([newLog, ...logs]);
    
    // Reset form
    setBloodPressure({ systolic: "", diastolic: "" });
    setBloodSugar("");
    setHeartRate("");
    setWeight("");
    setNotes("");
  };

  const handleDeleteLog = (id: string) => {
    setLogs(logs.filter((log) => log.id !== id));
  };
  
  const chartData = logs
    .map(log => {
      const value = chartMetric === 'bloodPressure' ? log.bloodPressure?.systolic : log[chartMetric];
      return {
        date: format(new Date(log.date), 'MMM d'),
        value: typeof value === 'number' ? value : null,
        diastolic: chartMetric === 'bloodPressure' ? log.bloodPressure?.diastolic : null,
      };
    })
    .filter(d => d.value !== null)
    .reverse();

  const metricLabels: {[key: string]: string} = {
      bloodPressure: "Blood Pressure (mmHg)",
      bloodSugar: "Blood Sugar (mg/dL)",
      heartRate: "Heart Rate (BPM)",
      weight: "Weight (kg)"
  }
  
  const getLogEntries = (log: VitalLog) => {
    const entries = [];
    if (log.bloodPressure) entries.push({metric: 'BP', value: `${log.bloodPressure.systolic}/${log.bloodPressure.diastolic}`});
    if (log.bloodSugar) entries.push({metric: 'Sugar', value: `${log.bloodSugar} mg/dL`});
    if (log.heartRate) entries.push({metric: 'Heart Rate', value: `${log.heartRate} BPM`});
    if (log.weight) entries.push({metric: 'Weight', value: `${log.weight} kg`});
    
    // Handle case where there's only a note
    if (entries.length === 0 && log.notes) {
        entries.push({metric: 'Note', value: log.notes});
    }
    return entries;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Log New Vital Signs</CardTitle>
            <CardDescription>Record your current health metrics. Only fill what you've measured.</CardDescription>
          </CardHeader>
          <form onSubmit={handleAddLog}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Blood Pressure (Systolic/Diastolic)</Label>
                <div className="flex gap-2">
                  <Input type="number" value={bloodPressure.systolic} onChange={(e) => setBloodPressure({...bloodPressure, systolic: e.target.value})} placeholder="e.g., 120" />
                  <Input type="number" value={bloodPressure.diastolic} onChange={(e) => setBloodPressure({...bloodPressure, diastolic: e.target.value})} placeholder="e.g., 80" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood-sugar">Blood Sugar (mg/dL)</Label>
                <Input id="blood-sugar" type="number" value={bloodSugar} onChange={(e) => setBloodSugar(e.target.value)} placeholder="e.g., 90" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heart-rate">Heart Rate (BPM)</Label>
                <Input id="heart-rate" type="number" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} placeholder="e.g., 72" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g., 70.5" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Feeling tired" />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">Add Log</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <div className="lg:col-span-3 space-y-6">
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle>Vitals History Chart</CardTitle>
                        <CardDescription>Visualize your health trends over time.</CardDescription>
                    </div>
                     <Select value={chartMetric} onValueChange={(v) => setChartMetric(v as any)}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select a metric" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="heartRate">Heart Rate</SelectItem>
                            <SelectItem value="bloodPressure">Blood Pressure</SelectItem>
                            <SelectItem value="bloodSugar">Blood Sugar</SelectItem>
                            <SelectItem value="weight">Weight</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
            </CardHeader>
            <CardContent>
                 {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={['auto', 'auto']}/>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))'
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="value" name={metricLabels[chartMetric].split(' ')[0]} stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                             {chartMetric === 'bloodPressure' && (
                                <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="hsl(var(--accent))" />
                             )}
                        </LineChart>
                    </ResponsiveContainer>
                 ) : (
                     <div className="h-[250px] flex flex-col items-center justify-center rounded-lg border border-dashed">
                        <div className="text-center text-muted-foreground">
                            <HeartPulse className="mx-auto h-12 w-12" />
                            <p className="mt-4 font-semibold">Not enough data to display chart.</p>
                            <p className="mt-1 text-sm">Log some vitals to see your trends.</p>
                        </div>
                    </div>
                 )}
            </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Vitals Log History</CardTitle>
            <CardDescription>A record of your measured vital signs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length > 0 ? (
                  logs.map(log => {
                    const entries = getLogEntries(log);
                    return entries.map((entry, index) => (
                        <TableRow key={`${log.id}-${entry.metric}`}>
                            {index === 0 ? (
                                <TableCell rowSpan={entries.length} className="align-top font-medium">{format(new Date(log.date), 'PPp')}</TableCell>
                            ) : null}
                            <TableCell>{entry.metric}</TableCell>
                            <TableCell className="font-mono">{entry.value}</TableCell>
                            {index === 0 && log.notes ? (
                                 <TableCell rowSpan={entries.length} className="align-top max-w-[150px] truncate">{log.notes}</TableCell>
                            ): index === 0 ? <TableCell rowSpan={entries.length}></TableCell> : null }
                            {index === 0 ? (
                                <TableCell rowSpan={entries.length} className="text-right align-top">
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteLog(log.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            ) : null}
                        </TableRow>
                    ));
                  }).flat()
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <HeartPulse className="h-8 w-8" />
                        <span>No vitals recorded yet.</span>
                      </div>
                    </TableCell>
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
