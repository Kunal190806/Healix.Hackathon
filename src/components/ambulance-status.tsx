
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Siren, Clock, MapPin, Phone } from "lucide-react";
import { Button } from "./ui/button";

const statusUpdates = [
  { status: "Dispatched", time: 1, progress: 25 },
  { status: "En Route", time: 5, progress: 50 },
  { status: "Nearing Location", time: 9, progress: 85 },
  { status: "Arrived", time: 12, progress: 100 },
];

export default function AmbulanceStatus() {
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        const nextStatus = statusUpdates.find(s => s.time === newTime);
        if (nextStatus) {
          setCurrentStatusIndex(statusUpdates.indexOf(nextStatus));
        }
        if (newTime >= statusUpdates[statusUpdates.length - 1].time) {
          clearInterval(interval);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const currentUpdate = statusUpdates[currentStatusIndex];
  const totalTime = statusUpdates[statusUpdates.length - 1].time;
  const eta = Math.max(0, totalTime - timeElapsed);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Live Ambulance Tracking</CardTitle>
            <CardDescription>A map showing the ambulance's current location.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                {/* Placeholder for a real map */}
                <Image
                    src="https://picsum.photos/seed/map/1200/800"
                    alt="Map showing ambulance route"
                    fill
                    style={{objectFit: 'cover'}}
                    data-ai-hint="map"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Siren className="h-10 w-10 text-destructive animate-ping" />
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              <span>Status & ETA</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground">Estimated Time of Arrival</p>
              <p className="text-5xl font-bold font-mono">
                {String(Math.floor(eta / 60)).padStart(2, '0')}:
                {String(eta % 60).padStart(2, '0')}
              </p>
            </div>
            <div>
              <Progress value={currentUpdate.progress} className="h-4" />
              <p className="text-center text-primary font-semibold mt-2">{currentUpdate.status}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              <span>Dispatch Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-semibold">Vehicle #:</span> MH-01-AM-1234</p>
            <p><span className="font-semibold">Driver:</span> Raj Kumar</p>
            <p><span className="font-semibold">Contact:</span> +91 98765 43210</p>
            <p><span className="font-semibold">Destination:</span> 123 Health St, Wellness City, 400001</p>
          </CardContent>
           <CardFooter>
            <Button className="w-full">
              <Phone className="mr-2 h-4 w-4" />
              Contact Driver
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
