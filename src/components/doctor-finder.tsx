
"use client";

import { useState } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import type { Doctor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Stethoscope, MapPin, IndianRupee, User, BookOpen, Star, CalendarDays } from "lucide-react";
import Image from "next/image";

const sampleDoctors: Doctor[] = [
  // Delhi
  { id: 'd1', name: 'Dr. Priya Sharma', specialty: 'Cardiology', experience: 15, city: 'Delhi', fees: 1500, bio: 'Chief Cardiologist at Max Healthcare with extensive experience in interventional cardiology.', image: 'https://picsum.photos/400/400?random=1' },
  { id: 'd7', name: 'Dr. Aisha Gupta', specialty: 'Gynecology', experience: 14, city: 'Delhi', fees: 1400, bio: 'Dedicated to women\'s health, from adolescence to post-menopause. Practices at Fortis La Femme.', image: 'https://picsum.photos/400/400?random=7' },
  { id: 'd11', name: 'Dr. Neha Sharma', specialty: 'ENT', experience: 7, city: 'Delhi', fees: 900, bio: 'Expert in treating ear, nose, and throat disorders, including sinus issues.', image: 'https://picsum.photos/400/400?random=11' },
  { id: 'd13', name: 'Dr. Alok Kumar', specialty: 'Orthopedics', experience: 18, city: 'Delhi', fees: 1300, bio: 'Senior orthopedic surgeon at Indraprastha Apollo Hospitals.', image: 'https://picsum.photos/400/400?random=13' },
  { id: 'd14', name: 'Dr. Meenakshi Singh', specialty: 'Pediatrics', experience: 12, city: 'Delhi', fees: 850, bio: 'Specializes in pediatric critical care at Sir Ganga Ram Hospital.', image: 'https://picsum.photos/400/400?random=14' },
  // Mumbai
  { id: 'd2', name: 'Dr. Amit Joshi', specialty: 'Neurology', experience: 12, city: 'Mumbai', fees: 1800, bio: 'Specializes in treating stroke and epilepsy. Affiliated with Kokilaben Ambani Hospital.', image: 'https://picsum.photos/400/400?random=2' },
  { id: 'd8', name: 'Dr. Arjun Shetty', specialty: 'Cardiology', experience: 10, city: 'Mumbai', fees: 1600, bio: 'Consultant cardiologist focusing on preventative heart care and cardiac rehabilitation.', image: 'https://picsum.photos/400/400?random=8' },
  { id: 'd12', name: 'Dr. Rajesh Khanna', specialty: 'Psychiatry', experience: 16, city: 'Mumbai', fees: 2000, bio: 'Provides counseling and treatment for various mental health conditions.', image: 'https://picsum.photos/400/400?random=12' },
  { id: 'd15', name: 'Dr. Sneha Patil', specialty: 'Dermatology', experience: 9, city: 'Mumbai', fees: 1100, bio: 'Expert in laser treatments and cosmetic dermatology at Lilavati Hospital.', image: 'https://picsum.photos/400/400?random=15' },
  { id: 'd16', name: 'Dr. Rahul Desai', specialty: 'Gastroenterology', experience: 11, city: 'Mumbai', fees: 1700, bio: 'Specialist in liver diseases at Breach Candy Hospital.', image: 'https://picsum.photos/400/400?random=16' },
  // Bangalore
  { id: 'd3', name: 'Dr. Anjali Desai', specialty: 'Dermatology', experience: 8, city: 'Bangalore', fees: 1000, bio: 'Expert in cosmetic dermatology and skin allergies. Runs a private clinic in Koramangala.', image: 'https://picsum.photos/400/400?random=3' },
  { id: 'd9', name: 'Dr. Kavita Iyer', specialty: 'Dentist', experience: 9, city: 'Bangalore', fees: 700, bio: 'Focuses on cosmetic dentistry and root canal treatments.', image: 'https://picsum.photos/400/400?random=9' },
  { id: 'd17', name: 'Dr. Santosh Kumar', specialty: 'Urology', experience: 15, city: 'Bangalore', fees: 1400, bio: 'Leading urologist at Manipal Hospitals specializing in kidney stones.', image: 'https://picsum.photos/400/400?random=17' },
  { id: 'd18', name: 'Dr. Divya Nair', specialty: 'Ophthalmology', experience: 10, city: 'Bangalore', fees: 950, bio: 'Cataract and refractive surgeon at Narayana Nethralaya.', image: 'https://picsum.photos/400/400?random=18' },
  { id: 'd19', name: 'Dr. Vijay Rajan', specialty: 'Pulmonology', experience: 13, city: 'Bangalore', fees: 1250, bio: 'Expert in treating respiratory diseases at Fortis Hospital, Bannerghatta.', image: 'https://picsum.photos/400/400?random=19' },
  // Chennai
  { id: 'd4', name: 'Dr. Rohan Mehra', specialty: 'Orthopedics', experience: 20, city: 'Chennai', fees: 1200, bio: 'Leading orthopedic surgeon specializing in knee and hip replacements at Apollo Hospitals.', image: 'https://picsum.photos/400/400?random=4' },
  { id: 'd20', name: 'Dr. Lakshmi Menon', specialty: 'Endocrinology', experience: 11, city: 'Chennai', fees: 1350, bio: 'Specializes in diabetes and thyroid disorders at MIOT International.', image: 'https://picsum.photos/400/400?random=20' },
  { id: 'd21', name: 'Dr. Karthik Sundaram', specialty: 'Oncology', experience: 16, city: 'Chennai', fees: 1900, bio: 'Surgical oncologist at Adyar Cancer Institute.', image: 'https://picsum.photos/400/400?random=21' },
  { id: 'd22', name: 'Dr. Priya Murthy', specialty: 'Rheumatology', experience: 9, city: 'Chennai', fees: 1150, bio: 'Treats autoimmune and rheumatic diseases at Gleneagles Global Health City.', image: 'https://picsum.photos/400/400?random=22' },
  { id: 'd23', name: 'Dr. Anand Selvan', specialty: 'Nephrology', experience: 14, city: 'Chennai', fees: 1550, bio: 'Specialist in kidney disease and dialysis at SIMS Hospital.', image: 'https://picsum.photos/400/400?random=23' },
    // Pune
  { id: 'd6', name: 'Dr. Vikram Singh', specialty: 'Gastroenterology', experience: 10, city: 'Pune', fees: 1300, bio: 'Specialist in digestive diseases and endoscopic procedures at Ruby Hall Clinic.', image: 'https://picsum.photos/400/400?random=6' },
  { id: 'd10', name: 'Dr. Sameer Patil', specialty: 'Dentist', experience: 12, city: 'Pune', fees: 650, bio: 'Specialist in orthodontics and pediatric dentistry.', image: 'https://picsum.photos/400/400?random=10' },
  { id: 'd24', name: 'Dr. Aditi Deshpande', specialty: 'Gynecology', experience: 13, city: 'Pune', fees: 1200, bio: 'Consultant gynecologist at Jehangir Hospital.', image: 'https://picsum.photos/400/400?random=24' },
  { id: 'd25', name: 'Dr. Rohan Joshi', specialty: 'General Physician', experience: 8, city: 'Pune', fees: 750, bio: 'General physician with a focus on preventive healthcare and chronic disease management.', image: 'https://picsum.photos/400/400?random=25' },
  { id: 'd26', name: 'Dr. Ishita Kulkarni', specialty: 'Pediatrics', experience: 9, city: 'Pune', fees: 800, bio: 'Focuses on neonatal care and child nutrition.', image: 'https://picsum.photos/400/400?random=26' },
   // Hyderabad
  { id: 'd5', name: 'Dr. Sunita Reddy', specialty: 'Pediatrics', experience: 18, city: 'Hyderabad', fees: 800, bio: 'Compassionate pediatrician focused on child development and vaccination.', image: 'https://picsum.photos/400/400?random=5' },
  { id: 'd27', name: 'Dr. N.V. Rao', specialty: 'Cardiology', experience: 22, city: 'Hyderabad', fees: 1700, bio: 'Chief cardiologist at Care Hospitals, known for complex angioplasties.', image: 'https://picsum.photos/400/400?random=27' },
  { id: 'd28', name: 'Dr. Fatima Khan', specialty: 'Neurology', experience: 11, city: 'Hyderabad', fees: 1600, bio: 'Expert in movement disorders at Continental Hospitals.', image: 'https://picsum.photos/400/400?random=28' },
  { id: 'd29', name: 'Dr. Arjun Kumar', specialty: 'Orthopedics', experience: 15, city: 'Hyderabad', fees: 1400, bio: 'Specializes in sports injuries and arthroscopic surgery at Yashoda Hospitals.', image: 'https://picsum.photos/400/400?random=29' },
  { id: 'd30', name: 'Dr. Kavya Rao', specialty: 'Dermatology', experience: 7, city: 'Hyderabad', fees: 950, bio: 'Aesthetic dermatologist specializing in anti-aging treatments.', image: 'https://picsum.photos/400/400?random=30' },
  // Kolkata
  { id: 'd31', name: 'Dr. A. K. Banerjee', specialty: 'Neurology', experience: 25, city: 'Kolkata', fees: 2200, bio: 'Senior Neurologist at Apollo Gleneagles Hospitals, Kolkata.', image: 'https://picsum.photos/400/400?random=31' },
  { id: 'd32', name: 'Dr. Mita Sen', specialty: 'Gynecology', experience: 18, city: 'Kolkata', fees: 1300, bio: 'Specializes in high-risk pregnancies at Fortis Hospital, Kolkata.', image: 'https://picsum.photos/400/400?random=32' },
  { id: 'd33', name: 'Dr. Subrata Das', specialty: 'Cardiology', experience: 20, city: 'Kolkata', fees: 1800, bio: 'Interventional cardiologist at Medica Superspecialty Hospital.', image: 'https://picsum.photos/400/400?random=33' },
  { id: 'd34', name: 'Dr. Prosenjit Ghosh', specialty: 'Orthopedics', experience: 15, city: 'Kolkata', fees: 1100, bio: 'Joint replacement specialist at AMRI Hospitals.', image: 'https://picsum.photos/400/400?random=34' },
  { id: 'd35', name: 'Dr. Ishani Roy', specialty: 'Dermatology', experience: 10, city: 'Kolkata', fees: 900, bio: 'Cosmetic dermatologist with a clinic in Salt Lake.', image: 'https://picsum.photos/400/400?random=35' },
];

const specialties = [...new Set(sampleDoctors.map(d => d.specialty))].sort();

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
            <Dialog key={doctor.id}>
              <Card className="flex flex-col rounded-2xl">
                <CardHeader>
                   <div className="flex items-start gap-4">
                      <div className="relative h-20 w-20 rounded-full overflow-hidden">
                         <Image src={doctor.image} alt={doctor.name} fill={true} style={{objectFit: 'cover'}} data-ai-hint="doctor person" />
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
                  <Button className="flex-1">Book Now</Button>
                  <DialogTrigger asChild>
                    <Button variant="outline">View Profile</Button>
                  </DialogTrigger>
                </CardFooter>
              </Card>

              <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <div className="flex items-start gap-4">
                      <div className="relative h-24 w-24 rounded-full overflow-hidden">
                         <Image src={doctor.image} alt={doctor.name} fill={true} style={{objectFit: 'cover'}} data-ai-hint="doctor person" />
                      </div>
                      <div className="flex-1 pt-2">
                        <DialogTitle className="text-2xl font-bold font-headline">{doctor.name}</DialogTitle>
                        <DialogDescription>
                            <div className="text-primary font-semibold">{doctor.specialty}</div>
                            <div>{doctor.experience} years of experience</div>
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                <span className="font-bold">4.8</span>
                                <span className="text-xs text-muted-foreground">(245 reviews)</span>
                            </div>
                        </DialogDescription>
                      </div>
                    </div>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-sm">About</h3>
                        <p className="text-sm text-muted-foreground">{doctor.bio}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <h3 className="font-semibold">Consultation Fee</h3>
                            <p className="text-muted-foreground">₹ {doctor.fees}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Location</h3>
                            <p className="text-muted-foreground">{doctor.city}</p>
                        </div>
                         <div>
                            <h3 className="font-semibold">Availability</h3>
                            <p className="text-muted-foreground flex items-center gap-2">
                               <CalendarDays className="h-4 w-4" /> Next available: Tomorrow
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button className="w-full">Book Appointment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3">
            <Card className="h-48 flex flex-col items-center justify-center rounded-2xl">
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
