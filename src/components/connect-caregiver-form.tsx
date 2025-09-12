
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profile";
import { db } from "@/lib/firebase";
import { doc, updateDoc, writeBatch } from "firebase/firestore";

export default function ConnectCaregiverForm() {
  const { toast } = useToast();
  const { userProfile } = useProfile();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !userProfile) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please enter the 4-digit code." });
      return;
    }

    setIsLoading(true);

    // Hardcoded sample flow
    if (code === '1234') {
      try {
        const patientId = 'patient123'; // Sample patient ID
        const caregiverDocRef = doc(db, "users", userProfile.uid);
        await updateDoc(caregiverDocRef, { monitoringPatientId: patientId });

        toast({
          title: "Connection Successful!",
          description: `You are now monitoring the sample patient.`,
        });
        setIsSuccess(true);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "Could not update your profile. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Original logic for other codes (will fail as no real codes exist)
    try {
        throw new Error("Invalid code. Please enter '1234' for the demo.");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
        <Card className="text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle>Successfully Connected</CardTitle>
            <CardDescription>You can now view the sample patient's dashboard from the Caregiver Hub.</CardDescription>
        </Card>
    )
  }

  return (
    <Card className="max-w-lg mx-auto">
      <form onSubmit={handleConnect}>
        <CardHeader>
          <CardTitle>Enter Access Code</CardTitle>
          <CardDescription>This is a one-time code provided by the patient. For this demo, please enter "1234".</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="access-code">Patient's Access Code</Label>
            <Input 
              id="access-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              placeholder="1234"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="text-center text-2xl tracking-[1em] font-mono"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
