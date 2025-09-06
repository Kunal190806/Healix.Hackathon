"use client";

import { useState } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import type { PainLog } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Activity, Download, Trash2 } from "lucide-react";

export default function PainTracker() {
  const [logs, setLogs] = useLocalStorage<PainLog[]>("painLogs", []);
  const [level, setLevel] = useState(5);
  const [symptoms, setSymptoms] = useState("");

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    const newLog: PainLog = {
      id: crypto.randomUUID(),
      level,
      symptoms,
      date: new Date().toISOString(),
    };
    setLogs([newLog, ...logs]);
    setSymptoms("");
    setLevel(5);
  };

  const handleDeleteLog = (id: string) => {
    setLogs(logs.filter((log) => log.id !== id));
  };
  
  const handleDownloadCsv = () => {
    const headers = ["Date", "Time", "Pain Level (1-10)", "Symptoms"];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        format(new Date(log.date), 'yyyy-MM-dd'),
        format(new Date(log.date), 'HH:mm'),
        log.level,
        `"${log.symptoms.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = `pain_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Log New Pain Episode</CardTitle>
            <CardDescription>Record your current pain level and symptoms.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddLog} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pain-level">Pain Level: {level}</Label>
                <Slider id="pain-level" value={[level]} onValueChange={(val) => setLevel(val[0])} min={0} max={10} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>No Pain</span>
                  <span>Worst Pain</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms & Notes</Label>
                <Input id="symptoms" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="e.g., sharp pain in lower back, headache" required />
              </div>
              <Button type="submit" className="w-full">Add Log</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Your Pain Log History</CardTitle>
                <CardDescription>A record of your pain episodes.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadCsv} disabled={logs.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Download CSV
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Pain Level</TableHead>
                  <TableHead>Symptoms</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length > 0 ? (
                  logs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>{format(new Date(log.date), 'PPP')}</TableCell>
                      <TableCell>{log.level}/10</TableCell>
                      <TableCell className="max-w-[200px] truncate">{log.symptoms}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteLog(log.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Activity className="h-8 w-8" />
                        <span>No pain logs recorded yet.</span>
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
