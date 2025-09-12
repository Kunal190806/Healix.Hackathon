
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
import { collection, query, where, getDocs, doc, updateDoc, writeBatch } from "firebase/firestore";

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
    try {
      // Find the patient with the matching, unexpired access code
      const q = query(
        collection(db, "users"),
        where("accessCode", "==", code),
        where("role", "==", "patient")
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Invalid or expired code. Please check the code and try again.");
      }

      let patientDoc;
      let patientData;

      querySnapshot.forEach(doc => {
          const data = doc.data();
          // Check for expiration
          if (data.accessCodeExpires && new Date() < new Date(data.accessCodeExpires)) {
              patientDoc = doc;
              patientData = data;
          }
      });
      
      if (!patientDoc || !patientData) {
          throw new Error("Invalid or expired code. Please ask the patient for a new one.");
      }

      const patientId = patientDoc.id;

      // Use a batch write to update both documents atomically
      const batch = writeBatch(db);

      // 1. Update caregiver's profile
      const caregiverDocRef = doc(db, "users", userProfile.uid);
      batch.update(caregiverDocRef, { monitoringPatientId: patientId });

      // 2. Invalidate patient's access code
      const patientDocRef = doc(db, "users", patientId);
      batch.update(patientDocRef, { accessCode: null, accessCodeExpires: null });
      
      await batch.commit();

      toast({
        title: "Connection Successful!",
        description: `You are now monitoring ${patientData.name}.`,
      });
      setIsSuccess(true);

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
            <CardDescription>You can now view the patient's dashboard from the Caregiver Hub.</CardDescription>
        </Card>
    )
  }

  return (
    <Card className="max-w-lg mx-auto">
      <form onSubmit={handleConnect}>
        <CardHeader>
          <CardTitle>Enter Access Code</CardTitle>
          <CardDescription>This is a 4-digit, one-time code provided by the patient you wish to monitor.</CardDescription>
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
