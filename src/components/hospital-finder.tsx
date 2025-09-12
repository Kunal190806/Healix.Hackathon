
"use client";

import { useState, useEffect } from "react";
import type { Hospital, Doctor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Hospital as HospitalIcon, Stethoscope, MapPin, IndianRupee, User, Star, Clock, CheckCircle } from "lucide-react";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import type { User as FirebaseUser } from "firebase/auth";

const sampleHospitals: Hospital[] = [
  // Mumbai
  { id: 'h1', name: 'Fortis Hospital, Mulund', city: 'Mumbai', specialty: 'Cardiology, Neurology, Oncology', address: 'Mulund Goregaon Link Rd, Mumbai' },
  { id: 'h10', name: 'Lilavati Hospital & Research Centre', city: 'Mumbai', specialty: 'Multi-specialty, Gastroenterology', address: 'Bandra West, Mumbai' },
  { id: 'h13', name: 'Kokilaben Dhirubhai Ambani Hospital', city: 'Mumbai', specialty: 'Robotic Surgery, Multi-specialty', address: 'Andheri West, Mumbai' },
  { id: 'h14', name: 'Tata Memorial Hospital', city: 'Mumbai', specialty: 'Cancer Treatment, Research', address: 'Parel, Mumbai' },
  { id: 'h15', name: 'Breach Candy Hospital', city: 'Mumbai', specialty: 'Urology, Orthopedics', address: 'Breach Candy, Mumbai' },
  // Delhi
  { id: 'h4', name: 'Max Healthcare, Saket', city: 'Delhi', specialty: 'Multi-specialty, Cardiac Surgery', address: 'Press Enclave Road, Saket, New Delhi' },
  { id: 'h7', name: 'All India Institute of Medical Sciences (AIIMS)', city: 'Delhi', specialty: 'Multi-specialty, Research', address: 'Ansari Nagar, New Delhi' },
  { id: 'h12', name: 'Sir Ganga Ram Hospital', city: 'Delhi', specialty: 'Multi-specialty, Nephrology', address: 'Rajinder Nagar, New Delhi' },
  { id: 'h16', name: 'Indraprastha Apollo Hospitals', city: 'Delhi', specialty: 'Transplants, Pediatrics', address: 'Sarita Vihar, New Delhi' },
  { id: 'h17', name: 'BLK-MAX Super Speciality Hospital', city: 'Delhi', specialty: 'Bariatric Surgery, Oncology', address: 'Pusa Road, New Delhi' },
  // Bangalore
  { id: 'h3', name: 'Narayana Institute of Cardiac Sciences', city: 'Bangalore', specialty: 'Cardiology, Heart Transplants', address: '258/A, Bommasandra Industrial Area, Bangalore' },
  { id: 'h6', name: 'Manipal Hospitals, Old Airport Road', city: 'Bangalore', specialty: 'Multi-specialty, Emergency Care', address: '98, HAL Old Airport Rd, Bangalore' },
  { id: 'h18', name: 'Sakra World Hospital', city: 'Bangalore', specialty: 'Neurosciences, Orthopedics', address: 'Marathahalli - Sarjapur Outer Ring Rd, Bangalore' },
  { id: 'h19', name: 'Fortis Hospital, Bannerghatta Road', city: 'Bangalore', specialty: 'Oncology, Gastroenterology', address: 'Bannerghatta Road, Bangalore' },
  { id: 'h20', name: 'St. John\'s Medical College Hospital', city: 'Bangalore', specialty: 'Multi-specialty, Medical College', address: 'Sarjapur Road, Bangalore' },
  // Chennai
  { id: 'h2', name: 'Apollo Hospitals, Greams Road', city: 'Chennai', specialty: 'Oncology, Orthopedics', address: 'Greams Lane, Off Greams Road, Chennai' },
  { id: 'h21', name: 'MIOT International', city: 'Chennai', specialty: 'Trauma Care, Organ Transplants', address: 'Mount Poonamallee Road, Manapakkam, Chennai' },
  { id: 'h22', name: 'Fortis Malar Hospital', city: 'Chennai', specialty: 'Cardiology, Neurology', address: 'Adyar, Chennai' },
  { id: 'h23', name: 'Gleneagles Global Health City', city: 'Chennai', specialty: 'Multi-Organ Transplants', address: 'Perumbakkam, Chennai' },
  { id: 'h24', name: 'SIMS Hospital', city: 'Chennai', specialty: 'Multi-specialty, Advanced Surgery', address: 'Vadapalani, Chennai' },
  // Gurgaon
  { id: 'h5', name: 'Medanta - The Medicity', city: 'Gurgaon', specialty: 'Liver Transplant, Cardiology', address: 'CH Baktawar Singh Road, Gurgaon' },
  { id: 'h25', name: 'Artemis Hospital', city: 'Gurgaon', specialty: 'Cardiovascular, Oncology', address: 'Sector 51, Gurgaon' },
  { id: 'h26', name: 'Fortis Memorial Research Institute', city: 'Gurgaon', specialty: 'Neurosciences, Bone Marrow Transplant', address: 'Sector 44, Gurgaon' },
  { id: 'h27', name: 'CK Birla Hospital', city: 'Gurgaon', specialty: 'Mother & Child, Orthopedics', address: 'Sector 51, Gurgaon' },
  { id: 'h28', name: 'Paras Hospitals', city: 'Gurgaon', specialty: 'Neurology, Spine Services', address: 'Sector 43, Gurgaon' },
];

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
];

const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

const AppointmentBookingForm = dynamic(() => Promise.resolve(function AppointmentBookingForm({ doctor, user, onBookingConfirmed }: { doctor: Doctor; user: FirebaseUser | null; onBookingConfirmed: () => void; }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
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
    
    toast({
      title: "Appointment Booked!",
      description: `Your appointment with ${doctor.name} on ${format(selectedDate, "PPP")} at ${selectedTime} is confirmed.`,
    });
    
    onBookingConfirmed();
  };

  return (
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

        <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
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
    </DialogContent>
  );
}), { ssr: false, loading: () => <div className="h-64 flex justify-center items-center">Loading booking form...</div> });


export default function HospitalFinder() {
  const [hospitals] = useState<Hospital[]>(sampleHospitals);
  const [doctors] = useState<Doctor[]>(sampleDoctors);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [isHospitalDialogOpen, setIsHospitalDialogOpen] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const filteredHospitals = hospitals.filter(hospital => {
    const queryMatch = searchQuery ? 
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      hospital.specialty.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    const locationMatch = searchLocation ? hospital.city.toLowerCase().includes(searchLocation.toLowerCase()) : true;
    return queryMatch && locationMatch;
  });

  const getDoctorsByHospital = (hospitalName: string) => {
    return doctors.filter(doctor => doctor.hospital === hospitalName);
  }
  
  const handleDoctorSelection = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsBookingDialogOpen(true);
  };
  
  const closeAllDialogs = () => {
      setIsBookingDialogOpen(false);
      setIsHospitalDialogOpen(false);
      setSelectedDoctor(null);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search for Hospitals</CardTitle>
          <CardDescription>Find hospitals by name, specialty, or location.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="search-query">Illness or Specialty</Label>
            <Input 
              id="search-query" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder="e.g., Heart Pain, Neurology" 
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="search-location">City</Label>
            <Input 
              id="search-location" 
              value={searchLocation} 
              onChange={e => setSearchLocation(e.target.value)} 
              placeholder="e.g., Delhi" 
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredHospitals.length > 0 ? (
          filteredHospitals.map(hospital => (
            <Dialog key={hospital.id} onOpenChange={setIsHospitalDialogOpen}>
              <Card className="flex flex-col rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-start gap-3">
                    <HospitalIcon className="h-6 w-6 text-primary mt-1 flex-shrink-0" /> 
                    <span>{hospital.name}</span>
                  </CardTitle>
                  <CardDescription>{hospital.city}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <div className="flex items-start gap-2">
                    <Stethoscope className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm"><span className="font-semibold">Specialties:</span> {hospital.specialty}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm"><span className="font-semibold">Address:</span> {hospital.address}</p>
                  </div>
                </CardContent>
                <CardFooter>
                   <DialogTrigger asChild>
                    <Button className="w-full">View Doctors & Book</Button>
                  </DialogTrigger>
                </CardFooter>
              </Card>

              <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                      <DialogTitle className="text-2xl font-bold font-headline">Doctors at {hospital.name}</DialogTitle>
                      <DialogDescription>Select a doctor to book an appointment.</DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                      {getDoctorsByHospital(hospital.name).length > 0 ? (
                          getDoctorsByHospital(hospital.name).map(doctor => (
                            <Dialog key={doctor.id} open={isBookingDialogOpen && selectedDoctor?.id === doctor.id} onOpenChange={(open) => { if (!open) setSelectedDoctor(null); setIsBookingDialogOpen(open);}}>
                              <Card className="flex flex-col sm:flex-row items-start gap-4 p-4">
                                <div className="relative h-20 w-20 rounded-full overflow-hidden flex-shrink-0">
                                  <Image src={doctor.image} alt={doctor.name} fill={true} style={{objectFit: 'cover'}} data-ai-hint="doctor person" />
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-bold">{doctor.name}</h4>
                                    <p className="text-sm text-primary">{doctor.specialty}</p>
                                    <p className="text-xs text-muted-foreground">{doctor.experience} years experience</p>
                                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                                        <IndianRupee className="h-4 w-4" /> 
                                        <span>{doctor.fees} Consultation Fee</span>
                                    </p>
                                </div>
                                <DialogTrigger asChild>
                                  <Button onClick={() => handleDoctorSelection(doctor)}>Book Now</Button>
                                </DialogTrigger>
                              </Card>
                              {selectedDoctor && selectedDoctor.id === doctor.id && (
                                <AppointmentBookingForm 
                                  doctor={selectedDoctor} 
                                  user={user}
                                  onBookingConfirmed={closeAllDialogs} 
                                />
                              )}
                            </Dialog>
                          ))
                      ) : (
                          <div className="text-center text-muted-foreground p-8">
                              <User className="mx-auto h-10 w-10 mb-2" />
                              <p>No doctors listed for this hospital yet.</p>
                          </div>
                      )}
                  </div>
              </DialogContent>
            </Dialog>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3">
            <Card className="h-48 flex flex-col items-center justify-center">
              <div className="text-center text-muted-foreground">
                <HospitalIcon className="mx-auto h-12 w-12" />
                <p className="mt-4 font-semibold">No hospitals found.</p>
                <p className="mt-1 text-sm">Try adjusting your search terms.</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

    