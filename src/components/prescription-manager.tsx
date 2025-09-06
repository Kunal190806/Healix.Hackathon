"use client";

import { useState } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import type { Prescription } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Pill } from "lucide-react";

export default function PrescriptionManager() {
  const [prescriptions, setPrescriptions] = useLocalStorage<Prescription[]>("prescriptions", []);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [time, setTime] = useState("");

  const handleAddPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage || !frequency) return;
    const newPrescription: Prescription = {
      id: crypto.randomUUID(),
      name,
      dosage,
      frequency,
      time,
    };
    setPrescriptions([...prescriptions, newPrescription]);
    setName("");
    setDosage("");
    setFrequency("");
    setTime("");
  };

  const handleDeletePrescription = (id: string) => {
    setPrescriptions(prescriptions.filter((p) => p.id !== id));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Prescription</CardTitle>
            <CardDescription>Enter the details of your medication below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddPrescription} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="med-name">Medication Name</Label>
                <Input id="med-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Lisinopril" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input id="dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g., 10mg" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Input id="frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="e.g., Once a day" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time of Day</Label>
                <Input id="time" value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g., Morning" />
              </div>
              <Button type="submit" className="w-full">Add Medication</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Your Medications</CardTitle>
            <CardDescription>A list of your current prescriptions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptions.length > 0 ? (
                  prescriptions.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.dosage}</TableCell>
                      <TableCell>{p.frequency}</TableCell>
                      <TableCell>{p.time || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePrescription(p.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Pill className="h-8 w-8" />
                        <span>No prescriptions added yet.</span>
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
