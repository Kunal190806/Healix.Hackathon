
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { auth } from "@/lib/firebase";
import type { User } from "firebase/auth";
import { extractPrescriptionDetails } from "@/ai/flows/extract-prescription-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Pill, Camera, Upload, Loader2, Wand2, X, PlusCircle, ShoppingCart } from "lucide-react";
import dynamic from "next/dynamic";

const DialogContent = dynamic(() => import('@/components/ui/dialog').then(mod => mod.DialogContent), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>
});

type Medicine = {
  id: string;
  name: string;
  dosage: string;
  quantity: number;
  prices: {
    apollo: number;
    pharmeasy: number;
    offline: number;
  };
};

const generatePrices = () => {
    const base = Math.random() * 200 + 50; // Base price between 50 and 250
    return {
        apollo: parseFloat((base * (Math.random() * 0.2 + 0.9)).toFixed(2)), // -10% to +10%
        pharmeasy: parseFloat((base * (Math.random() * 0.2 + 0.85)).toFixed(2)), // -15% to +5%
        offline: parseFloat((base * 1.1).toFixed(2)), // 10% more
    }
}

export default function OrderMedicines() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  // Manual Add Form State
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraOn]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      setHasCameraPermission(false);
      toast({ variant: 'destructive', title: 'Camera Access Denied' });
      setIsCameraOn(false);
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
        setCapturedImage(canvas.toDataURL('image/jpeg'));
        setIsCameraOn(false);
      }
    }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setCapturedImage(e.target?.result as string);
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const handleScan = async () => {
    if (!capturedImage) return;
    setIsScanning(true);
    try {
      const result = await extractPrescriptionDetails({ imageDataUri: capturedImage });
      const newMedicine: Medicine = {
        id: crypto.randomUUID(),
        name: result.name,
        dosage: result.dosage,
        quantity: 1, // Default quantity
        prices: generatePrices(),
      };
      setMedicines(prev => [...prev, newMedicine]);
      setIsDialogOpen(false);
      toast({ title: "Scan Complete", description: "Medicine added to your list." });
    } catch (error) {
      toast({ variant: "destructive", title: "Scan Failed", description: "Could not extract details." });
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddManually = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity) return;
    const newMedicine: Medicine = {
      id: crypto.randomUUID(),
      name,
      dosage,
      quantity,
      prices: generatePrices(),
    };
    setMedicines(prev => [...prev, newMedicine]);
    setName("");
    setDosage("");
    setQuantity(1);
  };
  
  const handleDeleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(med => med.id !== id));
  };
  
  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setMedicines(prev => prev.map(med => med.id === id ? { ...med, quantity: newQuantity } : med));
  };
  
  const cheapestSource = (prices: Medicine['prices']) => {
      const minPrice = Math.min(prices.apollo, prices.pharmeasy, prices.offline);
      if (minPrice === prices.apollo) return 'apollo';
      if (minPrice === prices.pharmeasy) return 'pharmeasy';
      return 'offline';
  }

  const totalCost = useMemo(() => {
    return medicines.reduce((total, med) => {
        const cheapest = cheapestSource(med.prices);
        return total + med.prices[cheapest] * med.quantity;
    }, 0);
  }, [medicines]);

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!user) return <Card className="text-center p-8"><CardTitle>Please Log In</CardTitle><CardDescription>You need to be logged in to order medicines.</CardDescription></Card>;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scan Prescription</CardTitle>
              <CardDescription>Upload an image to auto-fill your medicines list.</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) {setCapturedImage(null); setIsCameraOn(false);}}}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Camera className="mr-2" />
                    Scan with AI
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                  <DialogHeader>
                    <DialogTitle>Scan Your Prescription</DialogTitle>
                    <DialogDescription>Upload or take a photo to extract medicine details.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    {!capturedImage ? (
                      <div>
                        {isCameraOn ? (
                          <div className="space-y-4">
                            <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay playsInline muted />
                            {hasCameraPermission === false && <Alert variant="destructive"><AlertTitle>Camera Access Denied</AlertTitle></Alert>}
                             <div className="flex justify-between items-center">
                              <Button onClick={handleCapture} disabled={hasCameraPermission === false}>Capture Photo</Button>
                              <Button variant="ghost" onClick={() => setIsCameraOn(false)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-4">
                            <Button className="flex-1" onClick={() => setIsCameraOn(true)}><Camera className="mr-2"/>Use Camera</Button>
                            <Button className="flex-1" asChild>
                              <label htmlFor="file-upload" className="cursor-pointer">
                                <Upload className="mr-2"/> Upload File
                                <input id="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileUpload}/>
                              </label>
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative"><img src={capturedImage} alt="Prescription" className="rounded-md max-h-64 w-auto mx-auto"/>
                          <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setCapturedImage(null)}><X className="h-4 w-4"/></Button>
                        </div>
                        <Button onClick={handleScan} disabled={isScanning} className="w-full">
                          {isScanning ? <><Loader2 className="mr-2 animate-spin"/>Scanning...</> : <><Wand2 className="mr-2"/>Extract Details</>}
                        </Button>
                      </div>
                    )}
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Add Medicine Manually</CardTitle>
            </CardHeader>
            <form onSubmit={handleAddManually}>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label htmlFor="med-name">Medication Name</Label><Input id="med-name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                <div className="space-y-2"><Label htmlFor="dosage">Dosage (optional)</Label><Input id="dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="quantity">Quantity</Label><Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} required min={1} /></div>
              </CardContent>
              <CardFooter><Button type="submit" className="w-full"><PlusCircle className="mr-2 h-4 w-4"/>Add to List</Button></CardFooter>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Your Medicine List</CardTitle>
              <CardDescription>Review and compare prices for your medicines.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Medicine</TableHead><TableHead>Qty</TableHead><TableHead>Apollo</TableHead><TableHead>PharmEasy</TableHead><TableHead>Offline</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {medicines.length > 0 ? medicines.map((med) => {
                    const cheapest = cheapestSource(med.prices);
                    return (
                        <TableRow key={med.id}>
                            <TableCell><div className="font-medium">{med.name}</div><div className="text-xs text-muted-foreground">{med.dosage}</div></TableCell>
                            <TableCell><Input type="number" value={med.quantity} onChange={e => handleQuantityChange(med.id, parseInt(e.target.value))} className="w-16 h-8" min={1}/></TableCell>
                            <TableCell className={cheapest === 'apollo' ? 'text-green-500 font-bold' : ''}>₹{med.prices.apollo.toFixed(2)}</TableCell>
                            <TableCell className={cheapest === 'pharmeasy' ? 'text-green-500 font-bold' : ''}>₹{med.prices.pharmeasy.toFixed(2)}</TableCell>
                            <TableCell className={cheapest === 'offline' ? 'text-green-500 font-bold' : ''}>₹{med.prices.offline.toFixed(2)}</TableCell>
                            <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDeleteMedicine(med.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                        </TableRow>
                    )
                  }) : <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Your list is empty.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
            {medicines.length > 0 && (
                <CardFooter className="flex-col items-stretch gap-4">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Estimated Total:</span>
                    <span>₹{totalCost.toFixed(2)}</span>
                  </div>
                  <Button size="lg" className="w-full" onClick={() => toast({ title: "Order Placed (Simulated)", description: `Your order for ₹${totalCost.toFixed(2)} has been submitted.` })}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Place Order
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">This is a simulation. No real order will be placed.</p>
                </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
