
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
  { id: 'h1', name: 'Fortis Hospital', city: 'Mumbai', specialty: 'Cardiology, Neurology', address: 'Mulund Goregaon Link Rd, Mumbai' },
  { id: 'h2', name: 'Apollo Hospitals', city: 'Chennai', specialty: 'Oncology, Orthopedics', address: 'Greams Lane, Off Greams Road, Chennai' },
  { id: 'h3', name: 'Narayana Institute of Cardiac Sciences', city: 'Bangalore', specialty: 'Cardiology', address: '258/A, Bommasandra Industrial Area, Bangalore' },
  { id: 'h4', name: 'Max Healthcare', city: 'Delhi', specialty: 'Multi-specialty', address: 'Press Enclave Road, Saket, New Delhi' },
  { id: 'h5', name: 'Medanta - The Medicity', city: 'Gurgaon', specialty: 'Liver Transplant, Cardiology', address: 'CH Baktawar Singh Road, Gurgaon' },
  { id: 'h6', name: 'Manipal Hospitals', city: 'Bangalore', specialty: 'Multi-specialty', address: '98, HAL Old Airport Rd, Bangalore' },
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
