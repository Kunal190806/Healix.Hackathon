
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
import { Activity, Download, Trash2, FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Logo from "./logo";

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}


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
    const appName = "MediSync Health Platform";
    const exportTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const description = "Pain Log History";

    const headers = ["Date", "Time", "Pain Level (1-10)", "Symptoms"];
    
    // Branded header
    const brandedHeader = [
        `${appName}`,
        `Export Date: ${exportTime}`,
        `${description}`,
        "" // Empty line for spacing
    ].join('\n');

    const csvContent = [
      brandedHeader,
      headers.join(','),
      ...logs.map(log => [
        format(new Date(log.date), 'yyyy-MM-dd'),
        format(new Date(log.date), 'HH:mm'),
        log.level,
        `"${log.symptoms.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-t;' });
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

  const handleDownloadPdf = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const appName = "MediSync";
    const reportTitle = "Pain Log History";
    const exportTime = format(new Date(), "PPP 'at' p");
    const copyright = `© ${new Date().getFullYear()} MediSync. All rights reserved.`;
    const contact = "Support: support@medisync.app";

    // Logo - SVG content
    const svgText = `<svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width="200"
      height="200"
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4ade80" />
          <stop offset="100%" stop-color="#22c55e" />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#60a5fa" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
      </defs>
      <g transform="translate(100,100)">
        <g transform="rotate(-15)">
          <path d="M-30,-70 C-30,-90 30,-90 30,-70 S-30,-50 30,-50" stroke="#a3e635" stroke-width="6" fill="none" />
          <path d="M-30,70 C-30,90 30,90 30,70 S-30,50 30,50" stroke="#a3e635" stroke-width="6" fill="none" />
          <line x1="-30" y1="0" x2="30" y2="0" stroke="#a3e635" stroke-width="6" />
          <path d="M-30, -70 L-30, 70" stroke="#a3e635" stroke-width="6" fill="none" />
          <path d="M30, -70 L30, 70" stroke="#a3e635" stroke-width="6" fill="none" />
          <g transform="translate(0, 0) scale(1.2)">
            <path d="M-35,35 C-60,10 -50,-40 -20,-50 C10,-60 40,-45 45,-20 C50,5 25,30 0,35 C-25,40 -30,35 -35,35 Z" fill="url(#grad2)" transform="translate(15, -55) rotate(-20) scale(0.9)" />
            <path d="M35,-35 C60,-10 50,40 20,50 C-10,60 -40,45 -45,20 C-50,-5 -25,-30 0,-35 C25,-40 30,-35 35,-35 Z" fill="url(#grad1)" transform="translate(-15, 55) rotate(160) scale(0.9)" />
            <path d="M0,0 C-20,-15 -10,-35 15,-40 C40,-45 50,-25 40,-5 C30,15 15,25 0,20 C-15,15 -10,5 0,0 Z" fill="#3b82f6" opacity="0.8" transform="translate(0,0) rotate(20)" />
          </g>
        </g>
      </g>
    </svg>`;
    const logoDataUrl = `data:image/svg+xml;base64,${btoa(svgText)}`;
    
    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(appName, 26, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(reportTitle, 14, 30);
    doc.setFontSize(10);
    doc.text(`Exported on: ${exportTime}`, 14, 35);
    
    // Add logo via canvas to support SVG
    const img = new Image();
    img.src = logoDataUrl;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const canvasContext = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 200;
        if (canvasContext) {
            canvasContext.drawImage(img, 0, 0);
            const pngDataUrl = canvas.toDataURL('image/png');
            doc.addImage(pngDataUrl, 'PNG', 14, 12, 10, 10);
        }

        // Table
        doc.autoTable({
          startY: 45,
          head: [["Date", "Time", "Pain Level (1-10)", "Symptoms"]],
          body: logs.map(log => [
            format(new Date(log.date), 'PPP'),
            format(new Date(log.date), 'p'),
            log.level,
            log.symptoms
          ]),
          headStyles: { fillColor: [37, 99, 235] }, // primary color
          styles: { cellPadding: 3, fontSize: 10 },
          margin: { top: 40 }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(copyright, 14, doc.internal.pageSize.height - 10);
            doc.text(contact, doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 10, { align: 'right' });
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        }

        doc.save(`pain-logs-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    };
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
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
                <CardTitle>Your Pain Log History</CardTitle>
                <CardDescription>A record of your pain episodes.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={logs.length === 0}>
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadCsv} disabled={logs.length === 0}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    CSV
                </Button>
            </div>
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
