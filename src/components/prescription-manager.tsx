
"use client";

import { useState, useRef, useEffect } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import type { Prescription } from "@/lib/types";
import { extractPrescriptionDetails, ExtractPrescriptionDetailsOutput } from "@/ai/flows/extract-prescription-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Pill, Camera, Upload, Loader2, Wand2, X } from "lucide-react";
import dynamic from "next/dynamic";

const DialogContent = dynamic(() => import('@/components/ui/dialog').then(mod => mod.DialogContent), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>
});


type ScannedData = ExtractPrescriptionDetailsOutput;

export default function PrescriptionManager() {
  const [prescriptions, setPrescriptions] = useLocalStorage<Prescription[]>("prescriptions", []);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [time, setTime] = useState("");

  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScannedData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraOn]);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
         throw new Error("Camera not supported on this browser");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
      setIsCameraOn(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if(context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUri);
        setIsCameraOn(false); // Turn off camera after capture
      }
    }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!capturedImage) return;
    setIsScanning(true);
    setScanResult(null);
    try {
      const result = await extractPrescriptionDetails({ imageDataUri: capturedImage });
      setScanResult(result);
    } catch (error) {
      console.error("Scanning failed:", error);
      toast({
        variant: "destructive",
        title: "Scan Failed",
        description: "Could not extract details from the image. Please try again with a clearer picture.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if(scanResult) {
      setName(scanResult.name);
      setDosage(scanResult.dosage);
      setFrequency(scanResult.frequency);
      setIsDialogOpen(false); // Close dialog on success
      toast({
        title: "Scan Complete",
        description: "Prescription details have been filled in. Please review and save.",
      });
    }
  }, [scanResult, toast]);

  const resetScan = () => {
    setCapturedImage(null);
    setScanResult(null);
    setIsScanning(false);
  };
  
  const handleDialogStateChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset state when closing dialog
      stopCamera();
      setIsCameraOn(false);
      setCapturedImage(null);
      setScanResult(null);
      setIsScanning(false);
    }
  }

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
            <CardDescription>Enter the details of your medication below or scan your prescription.</CardDescription>
          </CardHeader>
          <CardContent>
             <Dialog open={isDialogOpen} onOpenChange={handleDialogStateChange}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mb-4">
                    <Camera className="mr-2" />
                    Scan Prescription with AI
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                  <DialogHeader>
                    <DialogTitle>Scan Your Prescription</DialogTitle>
                    <DialogDescription>
                      Upload or take a photo of your prescription. The AI will attempt to extract the details.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    {!capturedImage ? (
                      <div>
                        {isCameraOn ? (
                          <div className="space-y-4">
                            <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay playsInline muted />
                            {hasCameraPermission === false && (
                              <Alert variant="destructive">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>Please allow camera access to use this feature.</AlertDescription>
                              </Alert>
                            )}
                             <div className="flex justify-between items-center">
                              <Button onClick={handleCapture} disabled={hasCameraPermission === false}>Capture Photo</Button>
                              <Button variant="ghost" onClick={() => setIsCameraOn(false)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-4">
                            <Button className="flex-1" onClick={() => setIsCameraOn(true)}><Camera className="mr-2"/>Use Camera</Button>
                            <Button className="flex-1" asChild>
                              <label htmlFor="file-upload">
                                <Upload className="mr-2"/> Upload File
                                <input id="file-upload" type="file" accept="image/*,.pdf" className="sr-only" onChange={handleFileUpload}/>
                              </label>
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative">
                          <img src={capturedImage} alt="Prescription" className="rounded-md max-h-64 w-auto mx-auto"/>
                          <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={resetScan}>
                            <X className="h-4 w-4"/>
                          </Button>
                        </div>
                        <Button onClick={handleScan} disabled={isScanning} className="w-full">
                          {isScanning ? (
                            <><Loader2 className="mr-2 animate-spin"/>Scanning...</>
                          ) : (
                            <><Wand2 className="mr-2"/>Extract Details</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </DialogContent>
              </Dialog>
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
