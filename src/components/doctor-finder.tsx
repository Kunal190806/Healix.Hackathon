
"use client";

import { useState } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import type { Doctor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stethoscope, MapPin, IndianRupee, User, BookOpen } from "lucide-react";
import Image from "next/image";

const sampleDoctors: Doctor[] = [
  { id: 'd1', name: 'Dr. Priya Sharma', specialty: 'Cardiology', experience: 15, city: 'Delhi', fees: 1500, bio: 'Chief Cardiologist at Max Healthcare with extensive experience in interventional cardiology.', image: 'https://picsum.photos/400/400?random=1' },
  { id: 'd2', name: 'Dr. Sameer Khan', specialty: 'Neurology', experience: 12, city: 'Mumbai', fees: 1800, bio: 'Specializes in treating stroke and epilepsy. Affiliated with Kokilaben Ambani Hospital.', image: 'https://picsum.photos/400/400?random=2' },
  { id: 'd3', name: 'Dr. Anjali Desai', specialty: 'Dermatology', experience: 8, city: 'Bangalore', fees: 1000, bio: 'Expert in cosmetic dermatology and skin allergies. Runs a private clinic in Koramangala.', image: 'https://picsum.photos/400/400?random=3' },
  { id: 'd4', name: 'Dr. Rohan Mehra', specialty: 'Orthopedics', experience: 20, city: 'Chennai', fees: 1200, bio: 'Leading orthopedic surgeon specializing in knee and hip replacements at Apollo Hospitals.', image: 'https://picsum.photos/400/400?random=4' },
  { id: 'd5', name: 'Dr. Sunita Reddy', specialty: 'Pediatrics', experience: 18, city: 'Hyderabad', fees: 800, bio: 'Compassionate pediatrician focused on child development and vaccination.', image: 'https://picsum.photos/400/400?random=5' },
  { id: 'd6', name: 'Dr. Vikram Singh', specialty: 'Gastroenterology', experience: 10, city: 'Pune', fees: 1300, bio: 'Specialist in digestive diseases and endoscopic procedures at Ruby Hall Clinic.', image: 'https://picsum.photos/400/400?random=6' },
  { id: 'd7', name: 'Dr. Aisha Gupta', specialty: 'Gynecology', experience: 14, city: 'Delhi', fees: 1400, bio: 'Dedicated to women\'s health, from adolescence to post-menopause. Practices at Fortis La Femme.', image: 'https://picsum.photos/400/400?random=7' },
  { id: 'd8', name: 'Dr. Arjun Patel', specialty: 'Cardiology', experience: 10, city: 'Mumbai', fees: 1600, bio: 'Consultant cardiologist focusing on preventative heart care and cardiac rehabilitation.', image: 'https://picsum.photos/400/400?random=8' },
];

const specialties = [...new Set(sampleDoctors.map(d => d.specialty))];

export default function DoctorFinder() {
  const [doctors, setDoctors] = useLocalStorage<Doctor[]>("doctors", sampleDoctors);
  
  const [searchSpecialty, setSearchSpecialty] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const filteredDoctors = doctors.filter(doctor => {
    const specialtyMatch = searchSpecialty ? doctor.specialty === searchSpecialty : true;
    const locationMatch = searchLocation ? doctor.city.toLowerCase().includes(searchLocation.toLowerCase()) : true;
    return specialtyMatch && locationMatch;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find the Right Doctor</CardTitle>
          <CardDescription>Filter by specialty and location to find a doctor near you.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="search-specialty">Specialty</Label>
            <Select value={searchSpecialty} onValueChange={(value) => setSearchSpecialty(value === 'any' ? '' : value)}>
              <SelectTrigger id="search-specialty">
                <SelectValue placeholder="Any Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Specialty</SelectItem>
                {specialties.map(specialty => <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="search-location">City</Label>
            <Input 
              id="search-location" 
              value={searchLocation} 
              onChange={e => setSearchLocation(e.target.value)} 
              placeholder="e.g., Mumbai" 
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map(doctor => (
            <Card key={doctor.id} className="flex flex-col">
              <CardHeader>
                 <div className="flex items-start gap-4">
                    <div className="relative h-20 w-20 rounded-full overflow-hidden">
                       <Image src={doctor.image} alt={doctor.name} layout="fill" objectFit="cover" data-ai-hint="doctor person" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-xl font-headline">{doctor.name}</CardTitle>
                        <p className="text-sm text-primary">{doctor.specialty}</p>
                        <p className="text-xs text-muted-foreground">{doctor.experience} years experience</p>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                 <p className="text-sm text-muted-foreground italic leading-relaxed">"{doctor.bio}"</p>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{doctor.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  <span>{doctor.fees} Consultation Fee</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button className="flex-1">Book Appointment</Button>
                <Button variant="outline">View Profile</Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3">
            <Card className="h-48 flex flex-col items-center justify-center">
              <div className="text-center text-muted-foreground">
                <User className="mx-auto h-12 w-12" />
                <p className="mt-4 font-semibold">No doctors found.</p>
                <p className="mt-1 text-sm">Try adjusting your search terms.</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
