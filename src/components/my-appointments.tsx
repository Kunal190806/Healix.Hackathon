
"use client";

import { useState } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import type { Appointment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, CalendarCheck, CalendarX, CalendarClock } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MyAppointments() {
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>("appointments", []);

  const handleCancelAppointment = (id: string) => {
    setAppointments(
      appointments.map(app => 
        app.id === id ? { ...app, status: "Cancelled" } : app
      )
    );
  };
  
  const upcomingAppointments = appointments.filter(a => new Date(a.date) >= new Date() && a.status === 'Confirmed');
  const pastAppointments = appointments.filter(a => new Date(a.date) < new Date() || a.status !== 'Confirmed');

  return (
    <Tabs defaultValue="upcoming">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upcoming"><CalendarClock className="mr-2 h-4 w-4" />Upcoming</TabsTrigger>
        <TabsTrigger value="past"><CalendarCheck className="mr-2 h-4 w-4" />Past & Cancelled</TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Here are your scheduled consultations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map(app => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{format(new Date(app.date), "EEE, MMM d, yyyy")} at {app.time}</TableCell>
                      <TableCell>{app.doctorName}</TableCell>
                      <TableCell>{app.specialty}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">Cancel</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently cancel your appointment with {app.doctorName}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Go Back</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCancelAppointment(app.id)}>
                                Yes, Cancel
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-8 w-8" />
                        <span>No upcoming appointments.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="past" className="mt-6">
         <Card>
          <CardHeader>
            <CardTitle>Past & Cancelled Appointments</CardTitle>
            <CardDescription>A history of your previous consultations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastAppointments.length > 0 ? (
                  pastAppointments.map(app => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{format(new Date(app.date), "EEE, MMM d, yyyy")} at {app.time}</TableCell>
                      <TableCell>{app.doctorName}</TableCell>
                      <TableCell>{app.specialty}</TableCell>
                       <TableCell className="text-right">
                        <Badge variant={app.status === 'Cancelled' ? 'destructive' : 'secondary'}>
                            {app.status === 'Cancelled' ? <CalendarX className="mr-1 h-3 w-3"/> : <CalendarCheck className="mr-1 h-3 w-3"/>}
                            {app.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                       <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-8 w-8" />
                        <span>No past appointments found.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
