
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, CheckCircle, Hospital } from "lucide-react";
import type { Hospital as HospitalType } from "@/lib/types";

const sampleHospitals: HospitalType[] = [
  { id: 'h1', name: 'Fortis Hospital, Mulund', city: 'Mumbai', specialty: 'Cardiology, Neurology, Oncology', address: 'Mulund Goregaon Link Rd, Mumbai' },
  { id: 'h4', name: 'Max Healthcare, Saket', city: 'Delhi', specialty: 'Multi-specialty, Cardiac Surgery', address: 'Press Enclave Road, Saket, New Delhi' },
  { id: 'h3', name: 'Narayana Institute of Cardiac Sciences', city: 'Bangalore', specialty: 'Cardiology, Heart Transplants', address: '258/A, Bommasandra Industrial Area, Bangalore' },
  { id: 'h2', name: 'Apollo Hospitals, Greams Road', city: 'Chennai', specialty: 'Oncology, Orthopedics', address: 'Greams Lane, Off Greams Road, Chennai' },
  { id: 'h5', name: 'Medanta - The Medicity', city: 'Gurgaon', specialty: 'Liver Transplant, Cardiology', address: 'CH Baktawar Singh Road, Gurgaon' },
];

export default function PreArrivalInfo() {
  const [selectedHospital, setSelectedHospital] = useState("");
  const [patientName, setPatientName] = useState("Rohan Sharma");
  const [age, setAge] = useState("45");
  const [symptoms, setSymptoms] = useState("Chest pain, shortness of breath, pain in left arm.");
  const [vitals, setVitals] = useState("BP: 160/100, HR: 95 bpm");
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!selectedHospital || !patientName || !age || !symptoms) {
      toast({
        variant: "destructive",
        title: "Incomplete Information",
        description: "Please fill out all required fields before sending.",
      });
      return;
    }
    setStatus('sending');
    setTimeout(() => {
      setStatus('sent');
      toast({
        title: "Information Sent",
        description: `Patient details have been securely sent to ${sampleHospitals.find(h => h.id === selectedHospital)?.name}.`,
      });
    }, 2000);
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Send Patient Details to Hospital</CardTitle>
        <CardDescription>
          Informing the hospital in advance can help them prepare for your arrival, saving critical time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="hospital-select">Select Hospital</Label>
          <Select value={selectedHospital} onValueChange={setSelectedHospital}>
            <SelectTrigger id="hospital-select">
              <SelectValue placeholder="Choose the destination hospital..." />
            </SelectTrigger>
            <SelectContent>
              {sampleHospitals.map(h => (
                <SelectItem key={h.id} value={h.id}>
                  <div className="flex items-center gap-2">
                    <Hospital className="h-4 w-4 text-muted-foreground"/>
                    <div>
                      <p>{h.name}</p>
                      <p className="text-xs text-muted-foreground">{h.city}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="patient-name">Patient Name</Label>
            <Input id="patient-name" value={patientName} onChange={e => setPatientName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="patient-age">Patient Age</Label>
            <Input id="patient-age" type="number" value={age} onChange={e => setAge(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="symptoms">Chief Complaints / Symptoms</Label>
          <Textarea id="symptoms" value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={3} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vitals">Known Vitals (if available)</Label>
          <Input id="vitals" value={vitals} onChange={e => setVitals(e.target.value)} placeholder="e.g., Blood Pressure, Heart Rate" />
        </div>
      </CardContent>
      <CardFooter>
        {status === 'idle' && (
          <Button size="lg" className="w-full" onClick={handleSubmit} disabled={!selectedHospital}>
            <Send className="mr-2 h-5 w-5" />
            Send Pre-Arrival Information
          </Button>
        )}
        {status === 'sending' && (
          <Button size="lg" className="w-full" disabled>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Sending Information...
          </Button>
        )}
        {status === 'sent' && (
          <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" disabled>
            <CheckCircle className="mr-2 h-5 w-5" />
            Information Successfully Sent
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
