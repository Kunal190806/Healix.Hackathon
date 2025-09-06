
"use client";

import { useState } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import type { BloodDonor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, UserPlus, Search } from "lucide-react";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const sampleDonors: BloodDonor[] = [
  { id: 'bd1', name: 'Priya Sharma', bloodType: 'O+', location: 'Mumbai' },
  { id: 'bd2', name: 'Arjun Reddy', bloodType: 'A+', location: 'Bangalore' },
  { id: 'bd3', name: 'Sneha Gupta', bloodType: 'B-', location: 'Delhi' },
  { id: 'bd4', name: 'Rohan Desai', bloodType: 'AB+', location: 'Pune' },
  { id: 'bd5', name: 'Anjali Mehta', bloodType: 'O-', location: 'Chennai' },
  { id: 'bd6', name: 'Vikram Singh', bloodType: 'A-', location: 'Kolkata' },
];

export default function BloodDonorConnector() {
  const [donors, setDonors] = useLocalStorage<BloodDonor[]>("bloodDonors", sampleDonors);
  
  // State for registration form
  const [regName, setRegName] = useState("");
  const [regBloodType, setRegBloodType] = useState("");
  const [regLocation, setRegLocation] = useState("");

  // State for search filters
  const [searchBloodType, setSearchBloodType] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const handleRegisterDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regBloodType || !regLocation) return;
    const newDonor: BloodDonor = {
      id: crypto.randomUUID(),
      name: regName,
      bloodType: regBloodType,
      location: regLocation,
    };
    setDonors([...donors, newDonor]);
    setRegName("");
    setRegBloodType("");
    setRegLocation("");
  };

  const filteredDonors = donors.filter(donor => {
    const bloodTypeMatch = searchBloodType ? donor.bloodType === searchBloodType : true;
    const locationMatch = searchLocation ? donor.location.toLowerCase().includes(searchLocation.toLowerCase()) : true;
    return bloodTypeMatch && locationMatch;
  });

  return (
    <Tabs defaultValue="find">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="find"><Search className="mr-2 h-4 w-4" />Find a Donor</TabsTrigger>
        <TabsTrigger value="register"><UserPlus className="mr-2 h-4 w-4" />Register as a Donor</TabsTrigger>
      </TabsList>

      <TabsContent value="find" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Find Available Donors</CardTitle>
            <CardDescription>Filter donors by blood type and location.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="search-blood-type">Blood Type</Label>
                <Select value={searchBloodType} onValueChange={(value) => setSearchBloodType(value === 'any' ? '' : value)}>
                  <SelectTrigger id="search-blood-type">
                    <SelectValue placeholder="Any Blood Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    {bloodTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="search-location">Location</Label>
                <Input id="search-location" value={searchLocation} onChange={e => setSearchLocation(e.target.value)} placeholder="e.g., Delhi" />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonors.length > 0 ? (
                  filteredDonors.map(donor => (
                    <TableRow key={donor.id}>
                      <TableCell className="font-medium">{donor.name}</TableCell>
                      <TableCell>{donor.bloodType}</TableCell>
                      <TableCell>{donor.location}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Droplets className="h-8 w-8" />
                        <span>No matching donors found.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="register" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Become a Blood Donor</CardTitle>
            <CardDescription>Fill out the form below to join our donor network.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterDonor} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input id="reg-name" value={regName} onChange={e => setRegName(e.target.value)} placeholder="e.g., John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-blood-type">Blood Type</Label>
                <Select value={regBloodType} onValueChange={setRegBloodType} required>
                  <SelectTrigger id="reg-blood-type">
                    <SelectValue placeholder="Select your blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-location">Location (City/Area)</Label>
                <Input id="reg-location" value={regLocation} onChange={e => setRegLocation(e.target.value)} placeholder="e.g., Brooklyn, NY" required />
              </div>
              <Button type="submit" className="w-full">Register Now</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
