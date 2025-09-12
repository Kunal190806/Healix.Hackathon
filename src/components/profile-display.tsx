
"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import type { User } from "firebase/auth";
import type { UserProfile } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserCircle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProfileDisplay() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-4 text-muted-foreground">Loading Profile...</span>
      </div>
    );
  }

  if (!user) {
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

  return (
    <Card className="max-w-2xl mx-auto">
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
            <Badge variant="outline" className="w-fit text-base px-3 py-1 text-muted-foreground">
              <UserCircle className="h-5 w-5 mr-2" />
              <span>Not specified</span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
