
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
import { User, HeartPulse, Stethoscope, Handshake, Dumbbell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [patientName, setPatientName] = useState('');

  const handlePatientSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientName.trim()) {
      localStorage.setItem('userName', patientName);
      toast({
        title: "Account Created!",
        description: `Welcome to HEALIX, ${patientName}. You are now being redirected.`,
      });
      router.push('/');
    } else {
       toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter your full name.",
      });
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="patient-email">Email or Phone</Label>
                  <Input id="patient-email" placeholder="e.g., rohan.verma@example.com" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-password">Password</Label>
                <Input id="patient-password" type="password" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="patient-age">Age</Label>
                  <Input id="patient-age" type="number" placeholder="e.g., 34" required />
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
                  <Input id="patient-city" placeholder="e.g., Mumbai" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-history">Medical History (Optional)</Label>
                <Textarea id="patient-history" placeholder="e.g., Allergies, chronic conditions..." />
              </div>
              <Button type="submit" className="w-full">Create Patient Account</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Doctor Registration */}
      <TabsContent value="doctor" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Doctor Registration</CardTitle>
            <CardDescription>Join our network of trusted medical professionals.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor-name">Full Name</Label>
                    <Input id="doctor-name" placeholder="e.g., Dr. Priya Sharma" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-email">Email or Phone</Label>
                    <Input id="doctor-email" placeholder="e.g., priya.sharma@hospital.com" required />
                  </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor-password">Password</Label>
                <Input id="doctor-password" type="password" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor-specialization">Specialization</Label>
                    <Input id="doctor-specialization" placeholder="e.g., Cardiology" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-reg-number">Medical Registration Number</Label>
                    <Input id="doctor-reg-number" placeholder="e.g., MCI/12345" required />
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor-hospital">Hospital/Clinic Name</Label>
                    <Input id="doctor-hospital" placeholder="e.g., Fortis Hospital" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-city">City</Label>
                    <Input id="doctor-city" placeholder="e.g., Delhi" required />
                  </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="doctor-documents">Verification Documents</Label>
                <Input id="doctor-documents" type="file" />
                <p className="text-xs text-muted-foreground">Upload your medical license or registration proof.</p>
              </div>
              <Button type="submit" className="w-full">Register as a Doctor</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Donor Registration */}
       <TabsContent value="donor" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Blood Donor Registration</CardTitle>
            <CardDescription>Become a lifesaver. Join our donor network.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="donor-name">Full Name</Label>
                    <Input id="donor-name" placeholder="e.g., Aditi Verma" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="donor-email">Email or Phone</Label>
                    <Input id="donor-email" placeholder="e.g., aditi.v@example.com" required />
                  </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="donor-password">Password</Label>
                <Input id="donor-password" type="password" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="donor-blood-group">Blood Group</Label>
                     <Select>
                      <SelectTrigger id="donor-blood-group"><SelectValue placeholder="Select Blood Group" /></SelectTrigger>
                      <SelectContent>
                        {bloodTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="donor-city">City</Label>
                    <Input id="donor-city" placeholder="e.g., Bangalore" required />
                  </div>
              </div>
              <Button type="submit" className="w-full">Register as a Donor</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Trainer Registration */}
      <TabsContent value="trainer" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Fitness Trainer Registration</CardTitle>
            <CardDescription>Offer your expertise on our inclusive fitness platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="trainer-name">Full Name</Label>
                    <Input id="trainer-name" placeholder="e.g., Rajesh Kumar" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trainer-email">Email or Phone</Label>
                    <Input id="trainer-email" placeholder="e.g., r.kumar.fitness@example.com" required />
                  </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainer-password">Password</Label>
                <Input id="trainer-password" type="password" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="trainer-expertise">Expertise</Label>
                    <Input id="trainer-expertise" placeholder="e.g., Geriatric Fitness, Adaptive Yoga" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trainer-city">City</Label>
                    <Input id="trainer-city" placeholder="e.g., Pune" required />
                  </div>
              </div>
              <Button type="submit" className="w-full">Register as a Trainer</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Hospital Registration */}
       <TabsContent value="hospital" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Hospital Registration</CardTitle>
            <CardDescription>List your hospital on our platform to reach more patients.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hospital-name">Hospital Name</Label>
                <Input id="hospital-name" placeholder="e.g., Apollo Hospitals" required />
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hospital-email">Official Email or Phone</Label>
                    <Input id="hospital-email" placeholder="e.g., contact@apollohospitals.com" required />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="hospital-password">Password</Label>
                    <Input id="hospital-password" type="password" required />
                  </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospital-location">Location</Label>
                <Input id="hospital-location" placeholder="e.g., Greams Road, Chennai" required />
              </div>
               <div className="space-y-2">
                <Label htmlFor="hospital-specialties">Specialties Offered</Label>
                <Input id="hospital-specialties" placeholder="e.g., Cardiology, Oncology, Neurology" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospital-documents">Verification Documents</Label>
                <Input id="hospital-documents" type="file" />
                <p className="text-xs text-muted-foreground">Upload hospital registration proof.</p>
              </div>
              <Button type="submit" className="w-full">Register Your Hospital</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
