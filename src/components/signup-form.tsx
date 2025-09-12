
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'caregiver'>('patient');

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
       toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in your name, email, and password.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });
      
      const userProfileData = {
        userId: user.uid,
        name: name,
        email: email,
        role: role,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, "users", user.uid), userProfileData);

      toast({
        title: "Account Created!",
        description: `Welcome to HEALIX, ${name}. You are now being redirected.`,
      });

      setName('');
      setEmail('');
      setPassword('');

      router.push('/');

    } catch (error: any) {
      console.error("Firebase sign up error:", error);
      let description = "An unexpected error occurred. Please try again.";
      switch (error.code) {
        case 'auth/email-already-in-use':
          description = "This email address is already in use by another account.";
          break;
        case 'auth/invalid-email':
          description = "The email address is not valid.";
          break;
        case 'auth/weak-password':
          description = "The password is too weak. It must be at least 6 characters long.";
          break;
        case 'auth/configuration-not-found':
            description = "Firebase configuration is incorrect. Please contact support.";
            break;
      }
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Account</CardTitle>
        <CardDescription>Join HEALIX and take control of your health journey.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} className="space-y-4">
          <div className="space-y-2">
            <Label>I am a...</Label>
            <RadioGroup
                defaultValue="patient"
                onValueChange={(value: 'patient' | 'caregiver') => setRole(value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="patient" id="role-patient" />
                  <Label htmlFor="role-patient">Patient</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="caregiver" id="role-caregiver" />
                  <Label htmlFor="role-caregiver">Caregiver</Label>
                </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-name">Full Name</Label>
            <Input 
              id="signup-name" 
              placeholder="e.g., Rohan Verma" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input 
                id="signup-email" 
                type="email"
                placeholder="e.g., example@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input 
                id="signup-password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Must be at least 6 characters"
                required 
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
                Log in
            </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
