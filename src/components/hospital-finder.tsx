
"use client";

import { useState } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import type { Hospital } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hospital as HospitalIcon, Search, Stethoscope, MapPin } from "lucide-react";

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


export default function HospitalFinder() {
  const [hospitals, setHospitals] = useLocalStorage<Hospital[]>("hospitals", sampleHospitals);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const filteredHospitals = hospitals.filter(hospital => {
    const queryMatch = searchQuery ? 
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      hospital.specialty.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    const locationMatch = searchLocation ? hospital.city.toLowerCase().includes(searchLocation.toLowerCase()) : true;
    return queryMatch && locationMatch;
  });

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
            <Card key={hospital.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><HospitalIcon className="h-5 w-5 text-primary" /> {hospital.name}</CardTitle>
                <CardDescription>{hospital.city}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <div className="flex items-start gap-2">
                  <Stethoscope className="h-4 w-4 mt-1 text-muted-foreground" />
                  <p className="text-sm"><span className="font-semibold">Specialties:</span> {hospital.specialty}</p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <p className="text-sm"><span className="font-semibold">Address:</span> {hospital.address}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Book Appointment</Button>
              </CardFooter>
            </Card>
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
