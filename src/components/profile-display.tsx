
"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth.tsx";
import { useProfile } from "@/hooks/use-profile.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, UserCircle, Share2, KeyRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ProfileDisplay() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { userProfile, isLoading: isProfileLoading } = useProfile();
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const { toast } = useToast();

  const handleGenerateCode = async () => {
    if (!user) return;
    setIsGeneratingCode(true);
    try {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 15); // Code expires in 15 minutes

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        accessCode: code,
        accessCodeExpires: expiry.toISOString(),
      });

      toast({
        title: "Access Code Generated",
        description: `Your new one-time access code is ${code}. It will expire in 15 minutes.`,
      });
    } catch (error) {
      console.error("Error generating code:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate an access code. Please try again.",
      });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const isLoading = isAuthLoading || isProfileLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-4 text-muted-foreground">Loading Profile...</span>
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <Card className="text-center p-8">
        <CardTitle>Error Loading Profile</CardTitle>
        <CardDescription>Could not load your profile data. Please try logging in again.</CardDescription>
      </Card>
    );
  }
  
  const isCodeExpired = userProfile?.accessCodeExpires ? new Date() > new Date(userProfile.accessCodeExpires) : true;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Account Information</CardTitle>
          <CardDescription>This is your personal information on HEALIX.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Full Name</span>
            <span className="text-lg font-semibold">{user.displayName || "Not set"}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Email Address</span>
            <span className="text-lg font-semibold">{user.email}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Profile Access Code
          </CardTitle>
          <CardDescription>Generate a one-time code to securely share your profile with a caregiver or other user.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userProfile.accessCode && !isCodeExpired ? (
            <div className="text-center p-6 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Your one-time access code is:</p>
              <p className="text-5xl font-bold tracking-widest text-primary font-mono">{userProfile.accessCode}</p>
              <p className="text-xs text-muted-foreground mt-2">This code expires in {Math.round((new Date(userProfile.accessCodeExpires!).getTime() - new Date().getTime()) / 60000)} minutes.</p>
            </div>
          ) : (
              <div className="text-center p-6 bg-muted rounded-lg">
              <KeyRound className="h-10 w-10 mx-auto text-muted-foreground mb-2"/>
              <p className="text-muted-foreground">You have no active code.</p>
              </div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleGenerateCode} disabled={isGeneratingCode}>
            {isGeneratingCode ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
            {userProfile.accessCode && !isCodeExpired ? 'Generate New Code' : 'Generate Access Code'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
