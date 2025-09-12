
"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import type { User } from "firebase/auth";
import type { UserProfile } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, UserCircle, ShieldCheck, Share2, KeyRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function ProfileDisplay() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const authUnsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoading(!currentUser);

      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const firestoreUnsubscribe = onSnapshot(userDocRef, 
          (doc) => {
            if (doc.exists()) {
              setUserProfile(doc.data() as UserProfile);
            }
            setIsLoading(false);
          },
          (error) => {
            console.error("Error fetching user profile:", error);
            setIsLoading(false);
          }
        );
        return () => firestoreUnsubscribe();
      } else {
        setUser(null);
        setUserProfile(null);
        setIsLoading(false);
      }
    });

    return () => authUnsubscribe();
  }, []);

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
        <CardTitle>Please Log In</CardTitle>
        <CardDescription>You need to be logged in to view your profile.</CardDescription>
      </Card>
    );
  }

  const getRoleIcon = (role?: string) => {
    if (!role) return <UserCircle className="h-5 w-5 mr-2" />;
    switch (role.toLowerCase()) {
      case 'patient':
        return <UserCircle className="h-5 w-5 mr-2" />;
      case 'caregiver':
        return <ShieldCheck className="h-5 w-5 mr-2" />;
      default:
        return <UserCircle className="h-5 w-5 mr-2" />;
    }
  };
  
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
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Registered As</span>
            {userProfile?.role ? (
              <Badge variant="secondary" className="w-fit text-base px-3 py-1">
                {getRoleIcon(userProfile.role)}
                <span className="capitalize">{userProfile.role}</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="w-fit">
                Role not found
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
      
      {userProfile?.role === 'patient' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Share Your Profile
            </CardTitle>
            <CardDescription>Generate a one-time code to securely share your profile with a caregiver.</CardDescription>
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
      )}
    </div>
  );
}
