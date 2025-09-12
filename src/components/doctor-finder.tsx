
"use client";

import { useState, useEffect } from "react";
import type { Doctor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Stethoscope, MapPin, IndianRupee, User, Star, Clock, CheckCircle } from "lucide-react";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import type { User as FirebaseUser } from "firebase/auth";


const sampleDoctors: Doctor[] = [
  // Delhi
  { id: 'd1', name: 'Dr. Priya Sharma', specialty: 'Cardiology', experience: 15, city: 'Delhi', fees: 1500, hospital: 'Max Healthcare, Saket', bio: 'Chief Cardiologist at Max Healthcare with extensive experience in interventional cardiology.', image: 'https://picsum.photos/seed/d1/400/400' },
  { id: 'd7', name: 'Dr. Aisha Gupta', specialty: 'Gynecology', experience: 14, city: 'Delhi', fees: 1400, hospital: 'Fortis La Femme', bio: 'Dedicated to women\'s health, from adolescence to post-menopause. Practices at Fortis La Femme.', image: 'https://picsum.photos/seed/d7/400/400' },
  { id: 'd11', name: 'Dr. Neha Sharma', specialty: 'ENT', experience: 7, city: 'Delhi', fees: 900, hospital: 'Sir Ganga Ram Hospital', bio: 'Expert in treating ear, nose, and throat disorders, including sinus issues.', image: 'https://picsum.photos/seed/d11/400/400' },
  { id: 'd13', name: 'Dr. Alok Kumar', specialty: 'Orthopedics', experience: 18, city: 'Delhi', fees: 1300, hospital: 'Indraprastha Apollo Hospitals', bio: 'Senior orthopedic surgeon at Indraprastha Apollo Hospitals.', image: 'https://picsum.photos/seed/d13/400/400' },
  { id: 'd14', name: 'Dr. Meenakshi Singh', specialty: 'Pediatrics', experience: 12, city: 'Delhi', fees: 850, hospital: 'Sir Ganga Ram Hospital', bio: 'Specializes in pediatric critical care at Sir Ganga Ram Hospital.', image: 'https://picsum.photos/seed/d14/400/400' },
  // Mumbai
  { id: 'd2', name: 'Dr. Amit Joshi', specialty: 'Neurology', experience: 12, city: 'Mumbai', fees: 1800, hospital: 'Kokilaben Dhirubhai Ambani Hospital', bio: 'Specializes in treating stroke and epilepsy. Affiliated with Kokilaben Ambani Hospital.', image: 'https://picsum.photos/seed/d2/400/400' },
  { id: 'd8', name: 'Dr. Arjun Shetty', specialty: 'Cardiology', experience: 10, city: 'Mumbai', fees: 1600, hospital: 'Fortis Hospital, Mulund', bio: 'Consultant cardiologist focusing on preventative heart care and cardiac rehabilitation.', image: 'https://picsum.photos/seed/d8/400/400' },
  { id: 'd12', name: 'Dr. Rajesh Khanna', specialty: 'Psychiatry', experience: 16, city: 'Mumbai', fees: 2000, hospital: 'Lilavati Hospital & Research Centre', bio: 'Provides counseling and treatment for various mental health conditions.', image: 'https://picsum.photos/seed/d12/400/400' },
  { id: 'd15', name: 'Dr. Sneha Patil', specialty: 'Dermatology', experience: 9, city: 'Mumbai', fees: 1100, hospital: 'Lilavati Hospital & Research Centre', bio: 'Expert in laser treatments and cosmetic dermatology at Lilavati Hospital.', image: 'https://picsum.photos/seed/d15/400/400' },
  { id: 'd16', name: 'Dr. Rahul Desai', specialty: 'Gastroenterology', experience: 11, city: 'Mumbai', fees: 1700, hospital: 'Breach Candy Hospital', bio: 'Specialist in liver diseases at Breach Candy Hospital.', image: 'https://picsum.photos/seed/d16/400/400' },
  // Bangalore
  { id: 'd3', name: 'Dr. Anjali Desai', specialty: 'Dermatology', experience: 8, city: 'Bangalore', fees: 1000, hospital: 'Sakra World Hospital', bio: 'Expert in cosmetic dermatology and skin allergies. Runs a private clinic in Koramangala.', image: 'https://picsum.photos/seed/d3/400/400' },
  { id: 'd9', name: 'Dr. Kavita Iyer', specialty: 'Dentist', experience: 9, city: 'Bangalore', fees: 700, hospital: 'Manipal Hospitals, Old Airport Road', bio: 'Focuses on cosmetic dentistry and root canal treatments.', image: 'https://picsum.photos/seed/d9/400/400' },
  { id: 'd17', name: 'Dr. Santosh Kumar', specialty: 'Urology', experience: 15, city: 'Bangalore', fees: 1400, hospital: 'Manipal Hospitals, Old Airport Road', bio: 'Leading urologist at Manipal Hospitals specializing in kidney stones.', image: 'https://picsum.photos/seed/d17/400/400' },
  { id: 'd18', name: 'Dr. Divya Nair', specialty: 'Ophthalmology', experience: 10, city: 'Bangalore', fees: 950, hospital: 'Narayana Institute of Cardiac Sciences', bio: 'Cataract and refractive surgeon at Narayana Nethralaya.', image: 'https://picsum.photos/seed/d18/400/400' },
  { id: 'd19', name: 'Dr. Vijay Rajan', specialty: 'Pulmonology', experience: 13, city: 'Bangalore', fees: 1250, hospital: 'Fortis Hospital, Bannerghatta Road', bio: 'Expert in treating respiratory diseases at Fortis Hospital, Bannerghatta.', image: 'https://picsum.photos/seed/d19/400/400' },
  // Chennai
  { id: 'd4', name: 'Dr. Rohan Mehra', specialty: 'Orthopedics', experience: 20, city: 'Chennai', fees: 1200, hospital: 'Apollo Hospitals, Greams Road', bio: 'Leading orthopedic surgeon specializing in knee and hip replacements at Apollo Hospitals.', image: 'https://picsum.photos/seed/d4/400/400' },
  { id: 'd20', name: 'Dr. Lakshmi Menon', specialty: 'Endocrinology', experience: 11, city: 'Chennai', fees: 1350, hospital: 'MIOT International', bio: 'Specializes in diabetes and thyroid disorders at MIOT International.', image: 'https://picsum.photos/seed/d20/400/400' },
  { id: 'd21', name: 'Dr. Karthik Sundaram', specialty: 'Oncology', experience: 16, city: 'Chennai', fees: 1900, hospital: 'Apollo Hospitals, Greams Road', bio: 'Surgical oncologist at Adyar Cancer Institute.', image: 'https://picsum.photos/seed/d21/400/400' },
  { id: 'd22', name: 'Dr. Priya Murthy', specialty: 'Rheumatology', experience: 9, city: 'Chennai', fees: 1150, hospital: 'Gleneagles Global Health City', bio: 'Treats autoimmune and rheumatic diseases at Gleneagles Global Health City.', image: 'https://picsum.photos/seed/d22/400/400' },
  { id: 'd23', name: 'Dr. Anand Selvan', specialty: 'Nephrology', experience: 14, city: 'Chennai', fees: 1550, hospital: 'SIMS Hospital', bio: 'Specialist in kidney disease and dialysis at SIMS Hospital.', image: 'https://picsum.photos/seed/d23/400/400' },
    // Pune
  { id: 'd6', name: 'Dr. Vikram Singh', specialty: 'Gastroenterology', experience: 10, city: 'Pune', fees: 1300, hospital: 'Ruby Hall Clinic', bio: 'Specialist in digestive diseases and endoscopic procedures at Ruby Hall Clinic.', image: 'https://picsum.photos/seed/d6/400/400' },
  { id: 'd10', name: 'Dr. Sameer Patil', specialty: 'Dentist', experience: 12, city: 'Pune', fees: 650, hospital: 'Deenanath Mangeshkar Hospital', bio: 'Specialist in orthodontics and pediatric dentistry.', image: 'https://picsum.photos/seed/d10/400/400' },
  { id: 'd24', name: 'Dr. Aditi Deshpande', specialty: 'Gynecology', experience: 13, city: 'Pune', fees: 1200, hospital: 'Jehangir Hospital', bio: 'Consultant gynecologist at Jehangir Hospital.', image: 'https://picsum.photos/seed/d24/400/400' },
  { id: 'd25', name: 'Dr. Rohan Joshi', specialty: 'General Physician', experience: 8, city: 'Pune', fees: 750, hospital: 'Sahyadri Super Speciality Hospital', bio: 'General physician with a focus on preventive healthcare and chronic disease management.', image: 'https://picsum.photos/seed/d25/400/400' },
  { id: 'd26', name: 'Dr. Ishita Kulkarni', specialty: 'Pediatrics', experience: 9, city: 'Pune', fees: 800, hospital: 'KEM Hospital', bio: 'Focuses on neonatal care and child nutrition.', image: 'https://picsum.photos/seed/d26/400/400' },
   // Hyderabad
  { id: 'd5', name: 'Dr. Sunita Reddy', specialty: 'Pediatrics', experience: 18, city: 'Hyderabad', fees: 800, hospital: 'Rainbow Children\'s Hospital', bio: 'Compassionate pediatrician focused on child development and vaccination.', image: 'https://picsum.photos/seed/d5/400/400' },
  { id: 'd27', name: 'Dr. N.V. Rao', specialty: 'Cardiology', experience: 22, city: 'Hyderabad', fees: 1700, hospital: 'Care Hospitals', bio: 'Chief cardiologist at Care Hospitals, known for complex angioplasties.', image: 'https://picsum.photos/seed/d27/400/400' },
  { id: 'd28', name: 'Dr. Fatima Khan', specialty: 'Neurology', experience: 11, city: 'Hyderabad', fees: 1600, hospital: 'Continental Hospitals', bio: 'Expert in movement disorders at Continental Hospitals.', image: 'https://picsum.photos/seed/d28/400/400' },
  { id: 'd29', name: 'Dr. Arjun Kumar', specialty: 'Orthopedics', experience: 15, city: 'Hyderabad', fees: 1400, hospital: 'Yashoda Hospitals', bio: 'Specializes in sports injuries and arthroscopic surgery at Yashoda Hospitals.', image: 'https://picsum.photos/seed/d29/400/400' },
  { id: 'd30', name: 'Dr. Kavya Rao', specialty: 'Dermatology', experience: 7, city: 'Hyderabad', fees: 950, hospital: 'Apollo Hospitals, Jubilee Hills', bio: 'Aesthetic dermatologist specializing in anti-aging treatments.', image: 'https://picsum.photos/seed/d30/400/400' },
  // Kolkata
  { id: 'd31', name: 'Dr. A. K. Banerjee', specialty: 'Neurology', experience: 25, city: 'Kolkata', fees: 2200, hospital: 'Apollo Gleneagles Hospitals', bio: 'Senior Neurologist at Apollo Gleneagles Hospitals, Kolkata.', image: 'https://picsum.photos/seed/d31/400/400' },
  { id: 'd32', name: 'Dr. Mita Sen', specialty: 'Gynecology', experience: 18, city: 'Kolkata', fees: 1300, hospital: 'Fortis Hospital, Kolkata', bio: 'Specializes in high-risk pregnancies at Fortis Hospital, Kolkata.', image: 'https://picsum.photos/seed/d32/400/400' },
  { id: 'd33', name: 'Dr. Subrata Das', specialty: 'Cardiology', experience: 20, city: 'Kolkata', fees: 1800, hospital: 'Medica Superspecialty Hospital', bio: 'Interventional cardiologist at Medica Superspecialty Hospital.', image: 'https://picsum.photos/seed/d33/400/400' },
  { id: 'd34', name: 'Dr. Prosenjit Ghosh', specialty: 'Orthopedics', experience: 15, city: 'Kolkata', fees: 1100, hospital: 'AMRI Hospitals', bio: 'Joint replacement specialist at AMRI Hospitals.', image: 'https://picsum.photos/seed/d34/400/400' },
  { id: 'd35', name: 'Dr. Ishani Roy', specialty: 'Dermatology', experience: 10, city: 'Kolkata', fees: 900, hospital: ' Woodlands Multispeciality Hospital', bio: 'Cosmetic dermatologist with a clinic in Salt Lake.', image: 'https://picsum.photos/seed/d35/400/400' },
];

const specialties = [...new Set(sampleDoctors.map(d => d.specialty))].sort();

const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

const AppointmentBookingForm = dynamic(() => Promise.resolve(function AppointmentBookingForm({ doctor, user }: { doctor: Doctor, user: FirebaseUser | null }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { toast } = useToast();

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        variant: "destructive",
        title: "Incomplete Selection",
        description: "Please select both a date and a time slot.",
      });
      return;
    }
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You must be logged in to book an appointment.",
      });
      return;
    }

    const newAppointmentData = {
      userId: user.uid,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date: selectedDate.toISOString(),
      time: selectedTime,
      status: "Confirmed" as const,
    };
    
    await addDoc(collection(db, "appointments"), newAppointmentData);

    setIsConfirmed(true);
    
    toast({
      title: "Appointment Booked!",
      description: `Your appointment with ${doctor.name} on ${format(selectedDate, "PPP")} at ${selectedTime} is confirmed.`,
    });
  };

  if (isConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-xl font-bold font-headline mb-2">Appointment Confirmed!</h2>
        <p className="text-muted-foreground">
          You have successfully booked an appointment with {doctor.name}.
        </p>
        <p className="text-muted-foreground text-sm">
          on {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")} at {selectedTime}
        </p>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
      <div className="flex flex-col items-center">
        <h3 className="font-semibold mb-4">Select a Date</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
          className="rounded-md border"
        />
      </div>
      <div>
        <h3 className="font-semibold mb-4">Select a Time Slot</h3>
        <div className="grid grid-cols-2 gap-2">
          {timeSlots.map(slot => (
            <Button
              key={slot}
              variant={selectedTime === slot ? "default" : "outline"}
              onClick={() => setSelectedTime(slot)}
            >
              <Clock className="mr-2 h-4 w-4" />
              {slot}
            </Button>
          ))}
        </div>
        <Button onClick={handleBookAppointment} className="w-full mt-6" disabled={!selectedDate || !selectedTime || !user}>
          {user ? 'Confirm Booking' : 'Log in to Book'}
        </Button>
      </div>
    </div>
  );
}), { ssr: false, loading: () => <div className="h-64 flex justify-center items-center">Loading booking form...</div> });


export default function DoctorFinder() {
  const [doctors] = useState<Doctor[]>(sampleDoctors);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const [searchSpecialty, setSearchSpecialty] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const filteredDoctors = doctors.filter(doctor => {
    const specialtyMatch = searchSpecialty ? doctor.specialty.toLowerCase().includes(searchSpecialty.toLowerCase()) : true;
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
              <Card className="flex flex-col rounded-2xl overflow-hidden">
                <CardHeader>
                   <div className="flex items-start gap-4">
                      <div className="relative h-20 w-20 rounded-full overflow-hidden flex-shrink-0">
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
                   <p className="text-sm text-muted-foreground italic leading-relaxed line-clamp-3">"{doctor.bio}"</p>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{doctor.hospital}, {doctor.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <span>{doctor.fees} Consultation Fee</span>
                  </div>
                </CardContent>
                <CardFooter>
                   <DialogTrigger asChild>
                    <Button className="w-full">Book Appointment</Button>
                  </DialogTrigger>
                </CardFooter>
              </Card>

              <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <div className="flex flex-col md:flex-row items-start gap-6">
                      <div className="relative h-32 w-32 rounded-full overflow-hidden flex-shrink-0">
                         <Image src={doctor.image} alt={doctor.name} fill={true} style={{objectFit: 'cover'}} data-ai-hint="doctor person" />
                      </div>
                      <div className="flex-1 pt-2">
                        <DialogTitle className="text-3xl font-bold font-headline">{doctor.name}</DialogTitle>
                        <DialogDescription className="mt-1">
                            <div className="text-lg text-primary font-semibold">{doctor.specialty}</div>
                            <div>{doctor.experience} years of experience</div>
                            <div className="flex items-center gap-1 mt-2">
                                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                <span className="font-bold text-base">4.8</span>
                                <span className="text-sm text-muted-foreground">(245 reviews)</span>
                            </div>
                            <p className="text-base text-muted-foreground mt-4">{doctor.bio}</p>
                        </DialogDescription>
                      </div>
                    </div>
                </DialogHeader>
                <div className="py-4">
                  <AppointmentBookingForm doctor={doctor} user={user} />
                </div>
              </DialogContent>
            </Dialog>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3">
            <Card className="h-48 flex flex-col items-center justify-center">
              <div className="text-center text-muted-foreground">
                <User className="mx-auto h-12 w-12" />
                <p className="mt-4 font-semibold">No doctors found.</p>
                <p className="mt-1 text-sm">Try adjusting your search filters.</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

    