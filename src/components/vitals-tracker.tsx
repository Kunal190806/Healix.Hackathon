
"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, orderBy } from "firebase/firestore";
import type { User } from "firebase/auth";
import type { VitalLog, DeviceVitals } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subHours } from "date-fns";
import { HeartPulse, Trash2, Loader2, Watch, Moon, Footprints } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });

const sampleDeviceVitals: DeviceVitals = {
    lastSync: new Date().toISOString(),
    heartRate: 74,
    sleep: { hours: 7, minutes: 30 },
    steps: 8234
};

export default function VitalsTracker() {
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<VitalLog[]>([]);
  const [deviceVitals] = useState<DeviceVitals>(sampleDeviceVitals);
  const [isLoading, setIsLoading] = useState(true);

  // Form state for all vitals
  const [bloodPressure, setBloodPressure] = useState({ systolic: "", diastolic: "" });
  const [bloodSugar, setBloodSugar] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  
  const [chartMetric, setChartMetric] = useState<keyof Omit<VitalLog, 'id' | 'date' | 'notes'>>('heartRate');
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsLoading(true);
        const q = query(collection(db, "vitals"), where("userId", "==", currentUser.uid), orderBy("date", "desc"));
        const unsubFirestore = onSnapshot(q, (snapshot) => {
          const userLogs: VitalLog[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VitalLog));
          setLogs(userLogs);
          setIsLoading(false);
        });
        return () => unsubFirestore();
      } else {
        setUser(null);
        setLogs([]);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);


  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        alert("You must be logged in to add a log.");
        return;
    }

    const newLogData = {
      userId: user.uid,
      date: new Date().toISOString(),
      bloodPressure: bloodPressure.systolic && bloodPressure.diastolic ? {systolic: Number(bloodPressure.systolic), diastolic: Number(bloodPressure.diastolic)} : null,
      bloodSugar: bloodSugar ? Number(bloodSugar) : null,
      heartRate: heartRate ? Number(heartRate) : null,
      weight: weight ? Number(weight) : null,
      notes: notes,
    };
    
    // Filter out null values
    const cleanLogData = Object.fromEntries(Object.entries(newLogData).filter(([_, v]) => v != null && v !== ''));
    if (Object.keys(cleanLogData).length <= 2) { // only userId and date
        alert("Please enter at least one vital sign.");
        return;
    }

    await addDoc(collection(db, "vitals"), cleanLogData);
    
    // Reset form
    setBloodPressure({ systolic: "", diastolic: "" });
    setBloodSugar("");
    setHeartRate("");
    setWeight("");
    setNotes("");
  };

  const handleDeleteLog = async (id: string) => {
    await deleteDoc(doc(db, "vitals", id));
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
    
    if (entries.length === 0 && log.notes) {
        entries.push({metric: 'Note', value: log.notes});
    }
    return entries;
  }
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    return (
      <Card className="text-center p-8">
        <CardTitle>Please Log In</CardTitle>
        <CardDescription>You need to be logged in to track your vitals.</CardDescription>
      </Card>
    );
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
                <CardTitle className="flex items-center gap-2">
                    <Watch className="h-6 w-6 text-primary" />
                    <span>Device Sync (Sample)</span>
                </CardTitle>
                <CardDescription>
                    Real-time data from your connected health device. Last synced: {format(subHours(new Date(deviceVitals.lastSync), 2), 'p')}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-muted/50 rounded-lg">
                    <HeartPulse className="mx-auto h-8 w-8 text-red-500 mb-2" />
                    <p className="text-2xl font-bold">{deviceVitals.heartRate}</p>
                    <p className="text-xs text-muted-foreground">Heart Rate (BPM)</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                    <Moon className="mx-auto h-8 w-8 text-indigo-500 mb-2" />
                    <p className="text-2xl font-bold">{deviceVitals.sleep.hours}h {deviceVitals.sleep.minutes}m</p>
                    <p className="text-xs text-muted-foreground">Sleep Last Night</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                    <Footprints className="mx-auto h-8 w-8 text-green-500 mb-2" />
                    <p className="text-2xl font-bold">{deviceVitals.steps.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Steps Today</p>
                </div>
            </CardContent>
             <CardFooter>
                <Button variant="link" asChild>
                    <Link href="/connect-devices">Manage connected devices</Link>
                </Button>
            </CardFooter>
        </Card>
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
                            <Line type="monotone" dataKey="value" name={metricLabels[chartMetric].split(' ')[0]} stroke="hsl(var(--primary))" activeDot={{ r: 8 }} connectNulls />
                             {chartMetric === 'bloodPressure' && (
                                <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="hsl(var(--accent))" connectNulls />
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

    