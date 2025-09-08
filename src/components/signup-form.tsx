
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, HeartPulse, Stethoscope, Handshake, Dumbbell, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export default function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [patientName, setPatientName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePatientSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !email.trim() || !password.trim()) {
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

      // Update the user's profile with their name
      await updateProfile(user, { displayName: patientName });

      toast({
        title: "Account Created!",
        description: `Welcome to HEALIX, ${patientName}. You are now being redirected.`,
      });
      router.push('/');

    } catch (error: any) {
      console.error("Firebase sign up error:", error);
      let description = "An unexpected error occurred. Please try again.";
      // Provide more specific error messages
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
    <Tabs defaultValue="patient" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
        <TabsTrigger value="patient"><User className="mr-2 h-4 w-4" />Patient</TabsTrigger>
        <TabsTrigger value="doctor"><Stethoscope className="mr-2 h-4 w-4" />Doctor</TabsTrigger>
        <TabsTrigger value="donor"><Handshake className="mr-2 h-4 w-4" />Donor</TabsTrigger>
        <TabsTrigger value="trainer"><Dumbbell className="mr-2 h-4 w-4" />Trainer</TabsTrigger>
        <TabsTrigger value="hospital"><HeartPulse className="mr-2 h-4 w-4" />Hospital</TabsTrigger>
      </TabsList>
      
      {/* Patient Registration */}
      <TabsContent value="patient" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Registration</CardTitle>
            <CardDescription>Create your personal health account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePatientSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient-name">Full Name</Label>
                <Input 
                  id="patient-name" 
                  placeholder="e.g., Rohan Verma" 
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-email">Email</Label>
                  <Input 
                    id="patient-email" 
                    type="email"
                    placeholder="e.g., rohan.verma@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-password">Password</Label>
                  <Input 
                    id="patient-password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Must be at least 6 characters"
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="patient-age">Age</Label>
                  <Input id="patient-age" type="number" placeholder="e.g., 34" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="patient-gender">Gender</Label>
                   <Select>
                    <SelectTrigger id="patient-gender"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="patient-city">City</Label>
                  <Input id="patient-city" placeholder="e.g., Mumbai" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-history">Medical History (Optional)</Label>
                <Textarea id="patient-history" placeholder="e.g., Allergies, chronic conditions..." />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Patient Account'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Other Registration Forms */}
      <TabsContent value="doctor" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Doctor Registration</CardTitle>
            <CardDescription>Join our network of trusted medical professionals.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">This feature is coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>

       <TabsContent value="donor" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Blood Donor Registration</CardTitle>
            <CardDescription>Become a lifesaver. Join our donor network.</CardDescription>
          </CardHeader>
           <CardContent>
            <p className="text-center text-muted-foreground">This feature is coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="trainer" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Fitness Trainer Registration</CardTitle>
            <CardDescription>Offer your expertise on our inclusive fitness platform.</CardDescription>
          </CardHeader>
           <CardContent>
            <p className="text-center text-muted-foreground">This feature is coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>

       <TabsContent value="hospital" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Hospital Registration</CardTitle>
            <CardDescription>List your hospital on our platform to reach more patients.</CardDescription>
          </CardHeader>
           <CardContent>
            <p className="text-center text-muted-foreground">This feature is coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
