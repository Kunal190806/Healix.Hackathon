
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, CheckCircle, MapPin, Siren, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from 'next/navigation';

export default function CallAmbulance() {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'confirmed'>('idle');
  const [location, setLocation] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Simulate fetching user's location
    setTimeout(() => {
      setLocation("123 Health St, Wellness City, 400001");
    }, 500);
  }, []);

  const handleCallAmbulance = () => {
    setStatus('requesting');
    setTimeout(() => {
      setStatus('confirmed');
      setTimeout(() => {
        router.push('/ambulance-status');
      }, 2000);
    }, 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Alert variant="destructive" className="mb-6">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>For Emergency Use Only</AlertTitle>
        <AlertDescription>
          This feature is a simulation. In a real emergency, please dial your local emergency number immediately.
        </AlertDescription>
      </Alert>

      <Card className="text-center">
        <CardHeader>
          <Siren className="mx-auto h-16 w-16 text-destructive animate-pulse" />
          <CardTitle className="text-2xl font-bold mt-4">Confirm Your Location</CardTitle>
          <CardDescription>An ambulance will be dispatched to the address below.</CardDescription>
        </CardHeader>
        <CardContent>
          {location ? (
            <div className="p-4 bg-muted rounded-lg flex items-center justify-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <p className="text-lg font-semibold">{location}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <p>Fetching your location...</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {status === 'idle' && (
            <Button
              size="lg"
              className="w-full text-lg h-14"
              onClick={handleCallAmbulance}
              disabled={!location}
            >
              <Siren className="mr-2 h-6 w-6" />
              Confirm & Call Ambulance
            </Button>
          )}
          {status === 'requesting' && (
            <Button size="lg" className="w-full text-lg h-14" disabled>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Requesting...
            </Button>
          )}
          {status === 'confirmed' && (
            <Button size="lg" className="w-full text-lg h-14 bg-green-600" disabled>
              <CheckCircle className="mr-2 h-6 w-6" />
              Ambulance Dispatched
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
