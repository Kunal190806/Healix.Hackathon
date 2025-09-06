"use client";

import { useState } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import type { FitnessTrainer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, UserPlus, Search } from "lucide-react";

export default function InclusiveFitness() {
  const [trainers, setTrainers] = useLocalStorage<FitnessTrainer[]>("fitnessTrainers", []);

  // State for registration form
  const [regName, setRegName] = useState("");
  const [regSkills, setRegSkills] = useState("");
  const [regAvailability, setRegAvailability] = useState("");
  const [regLocation, setRegLocation] = useState("");

  // State for search filters
  const [searchSkills, setSearchSkills] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const handleRegisterTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regSkills || !regAvailability || !regLocation) return;
    const newTrainer: FitnessTrainer = {
      id: crypto.randomUUID(),
      name: regName,
      skills: regSkills,
      availability: regAvailability,
      location: regLocation,
    };
    setTrainers([...trainers, newTrainer]);
    setRegName("");
    setRegSkills("");
    setRegAvailability("");
    setRegLocation("");
  };

  const filteredTrainers = trainers.filter(trainer => {
    const skillsMatch = searchSkills ? trainer.skills.toLowerCase().includes(searchSkills.toLowerCase()) : true;
    const locationMatch = searchLocation ? trainer.location.toLowerCase().includes(searchLocation.toLowerCase()) : true;
    return skillsMatch && locationMatch;
  });

  return (
    <Tabs defaultValue="find">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="find"><Search className="mr-2 h-4 w-4" />Find a Trainer</TabsTrigger>
        <TabsTrigger value="register"><UserPlus className="mr-2 h-4 w-4" />Register as a Trainer</TabsTrigger>
      </TabsList>

      <TabsContent value="find" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Find an Inclusive Trainer</CardTitle>
            <CardDescription>Search for trainers based on their skills and location.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="search-skills">Skills</Label>
                <Input id="search-skills" value={searchSkills} onChange={e => setSearchSkills(e.target.value)} placeholder="e.g., wheelchair yoga, senior fitness" />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="search-location">Location</Label>
                <Input id="search-location" value={searchLocation} onChange={e => setSearchLocation(e.target.value)} placeholder="e.g., San Francisco" />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialized Skills</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainers.length > 0 ? (
                  filteredTrainers.map(trainer => (
                    <TableRow key={trainer.id}>
                      <TableCell className="font-medium">{trainer.name}</TableCell>
                      <TableCell>{trainer.skills}</TableCell>
                      <TableCell>{trainer.availability}</TableCell>
                      <TableCell>{trainer.location}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Dumbbell className="h-8 w-8" />
                        <span>No matching trainers found.</span>
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
            <CardTitle>Become an Inclusive Trainer</CardTitle>
            <CardDescription>Fill out your profile to be listed on our platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterTrainer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input id="reg-name" value={regName} onChange={e => setRegName(e.target.value)} placeholder="e.g., Jane Smith" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-skills">Specialized Skills</Label>
                <Input id="reg-skills" value={regSkills} onChange={e => setRegSkills(e.target.value)} placeholder="e.g., adaptive yoga, senior mobility" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-availability">Availability</Label>
                <Input id="reg-availability" value={regAvailability} onChange={e => setRegAvailability(e.target.value)} placeholder="e.g., Weekdays, 9am - 5pm" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-location">Location</Label>
                <Input id="reg-location" value={regLocation} onChange={e => setRegLocation(e.target.value)} placeholder="e.g., San Francisco Bay Area" required />
              </div>
              <Button type="submit" className="w-full">Create Profile</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
