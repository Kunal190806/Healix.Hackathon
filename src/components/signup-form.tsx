
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, HeartPulse, Stethoscope, Handshake, Dumbbell, Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Common state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (role: string) => {
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
      
      await setDoc(doc(db, "users", user.uid), { 
        uid: user.uid,
        name: name,
        email: email,
        role: role,
        createdAt: new Date().toISOString()
      });

      toast({
        title: "Account Created!",
        description: `Welcome to HEALIX, ${name}. You are now being redirected.`,
      });

      // Reset form fields
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

  const createForm = (role: string, title: string, description: string, fields: React.ReactNode, submitText: string) => {
    return (
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleSignUp(role); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${role}-name`}>Full Name / Organization Name</Label>
                <Input 
                  id={`${role}-name`} 
                  placeholder="e.g., Rohan Verma" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${role}-email`}>Email</Label>
                  <Input 
                    id={`${role}-email`} 
                    type="email"
                    placeholder="e.g., example@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${role}-password`}>Password</Label>
                  <Input 
                    id={`${role}-password`} 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Must be at least 6 characters"
                    required 
                  />
                </div>
              </div>
              {fields}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  submitText
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
    )
  };
  
  const resetFormFields = () => {
    setName('');
    setEmail('');
    setPassword('');
  };


  return (
    <Tabs defaultValue="patient" className="w-full" onValueChange={resetFormFields}>
      <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
        <TabsTrigger value="patient"><User className="mr-2 h-4 w-4" />Patient</TabsTrigger>
        <TabsTrigger value="caregiver"><ShieldCheck className="mr-2 h-4 w-4" />Caregiver</TabsTrigger>
        <TabsTrigger value="doctor"><Stethoscope className="mr-2 h-4 w-4" />Doctor</TabsTrigger>
        <TabsTrigger value="donor"><Handshake className="mr-2 h-4 w-4" />Donor</TabsTrigger>
        <TabsTrigger value="trainer"><Dumbbell className="mr-2 h-4 w-4" />Trainer</TabsTrigger>
        <TabsTrigger value="hospital"><HeartPulse className="mr-2 h-4 w-4" />Hospital</TabsTrigger>
      </TabsList>
      
      <TabsContent value="patient" className="mt-6">
        {createForm(
            'patient', 
            'Patient Registration', 
            'Create your personal health account.',
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
              </div>,
            'Create Patient Account'
        )}
      </TabsContent>
      
      <TabsContent value="caregiver" className="mt-6">
         {createForm(
            'caregiver', 
            'Caregiver Registration', 
            'Create an account to monitor and support a loved one.',
            <div className="space-y-2 pt-4">
                <Label htmlFor="patient-id">Patient's Unique ID or Email (Optional)</Label>
                <Input id="patient-id" placeholder="Enter the ID to link to a patient account" />
                <p className="text-xs text-muted-foreground">The patient can find their ID in their profile. You can link accounts later.</p>
            </div>,
            'Create Caregiver Account'
        )}
      </TabsContent>

      <TabsContent value="doctor" className="mt-6">
        {createForm(
            'doctor', 
            'Doctor Registration', 
            'Join our network of trusted medical professionals.',
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="doctor-specialty">Specialty</Label>
                    <Input id="doctor-specialty" placeholder="e.g., Cardiology" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="doctor-mci">MCI Registration Number</Label>
                    <Input id="doctor-mci" placeholder="e.g., 12345" />
                </div>
             </div>,
            'Create Doctor Account'
        )}
      </TabsContent>

       <TabsContent value="donor" className="mt-6">
        {createForm(
            'donor', 
            'Blood Donor Registration', 
            'Become a lifesaver. Join our donor network.',
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="donor-blood-type">Blood Type</Label>
                   <Select>
                    <SelectTrigger id="donor-blood-type"><SelectValue placeholder="Select Blood Type" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="donor-city">City</Label>
                    <Input id="donor-city" placeholder="e.g., Delhi" />
                </div>
             </div>,
            'Create Donor Account'
        )}
      </TabsContent>

      <TabsContent value="trainer" className="mt-6">
        {createForm(
            'trainer', 
            'Fitness Trainer Registration', 
            'Offer your expertise on our inclusive fitness platform.',
            <div className="space-y-2">
                <Label htmlFor="trainer-skills">Specialized Skills</Label>
                <Textarea id="trainer-skills" placeholder="e.g., Adaptive Yoga, Senior Mobility, Wheelchair Zumba..." />
            </div>,
            'Create Trainer Account'
        )}
      </TabsContent>

       <TabsContent value="hospital" className="mt-6">
        {createForm(
            'hospital', 
            'Hospital Registration', 
            'List your hospital on our platform to reach more patients.',
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="hospital-city">City</Label>
                    <Input id="hospital-city" placeholder="e.g., Bangalore" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hospital-address">Full Address</Label>
                    <Input id="hospital-address" placeholder="e.g., 123 Health St, Medical City" />
                </div>
             </div>,
            'Create Hospital Account'
        )}
      </TabsContent>
    </Tabs>
  );
}
