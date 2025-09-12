
"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import type { User } from "firebase/auth";
import type { VitalLog, HearingTestRecord, EyeTestResult, ResponseTimeResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { format } from "date-fns";
import { HeartPulse, Loader2, Watch, Moon, Footprints, Droplets, Flame, Thermometer, BrainCircuit, Eye, Ear, PlusCircle } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


const MetricCard = ({ icon, title, value, unit, description, href }: { icon: React.ReactNode, title: string, value: string | number | null | undefined, unit?: string, description?: string, href?: string }) => {
  const hasData = value !== null && value !== undefined && value !== '--';

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          {icon}
          <CardTitle className="text-lg font-headline">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center text-center">
        {hasData ? (
          <p className="text-5xl font-bold font-mono text-primary">
            {value}
            {unit && <span className="text-2xl text-muted-foreground ml-2">{unit}</span>}
          </p>
        ) : (
          <p className="text-5xl font-bold font-mono text-muted-foreground">--</p>
        )}
        {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
      </CardContent>
      {href && (
        <CardFooter>
          <Button variant="ghost" className="w-full" asChild>
            <Link href={href}>View History</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default function VitalsTracker() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [latestVitals, setLatestVitals] = useState<Partial<VitalLog>>({});
  const [latestHearingTest, setLatestHearingTest] = useState<HearingTestRecord | null>(null);
  const [latestEyeTest, setLatestEyeTest] = useState<EyeTestResult | null>(null);
  const [latestResponseTimeTest, setLatestResponseTimeTest] = useState<ResponseTimeResult | null>(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsLoading(false);
        setLatestVitals({});
        setLatestHearingTest(null);
        setLatestEyeTest(null);
        setLatestResponseTimeTest(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const createListener = <T,>(collectionName: string, setter: (data: T | null) => void) => {
      const q = query(collection(db, collectionName), where("userId", "==", user.uid), orderBy("date", "desc"), limit(1));
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          setter(snapshot.docs[0].data() as T);
        } else {
          setter(null);
        }
        setIsLoading(false);
      }, (error) => {
        console.error(`Error fetching ${collectionName}:`, error);
        setIsLoading(false);
      });
    };

    const unsubVitals = createListener<VitalLog>('vitals', setLatestVitals);
    const unsubHearing = createListener<HearingTestRecord>('hearingTestHistory', setLatestHearingTest);
    const unsubEye = createListener<EyeTestResult>('eyeTestHistory', setLatestEyeTest);
    const unsubResponse = createListener<ResponseTimeResult>('responseTimeHistory', setLatestResponseTimeTest);

    return () => {
      unsubVitals();
      unHearing();
      unsubEye();
      unsubResponse();
    };
  }, [user]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    return (
      <Card className="text-center p-8">
        <CardTitle>Please Log In</CardTitle>
        <CardDescription>You need to be logged in to view your vitals dashboard.</CardDescription>
      </Card>
    );
  }

  const sampleDeviceData = {
    heartRate: 74,
    bloodOxygen: 98,
    steps: 8234,
    calories: 1250,
    sleep: { hours: 7, minutes: 30 },
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Device Synced Vitals */}
        <MetricCard icon={<HeartPulse className="w-6 h-6 text-red-500" />} title="Heart Rate" value={sampleDeviceData.heartRate} unit="BPM" description="From Google Fit" href="/vitals-tracker/history" />
        <MetricCard icon={<Droplets className="w-6 h-6 text-sky-500" />} title="Blood Oxygen" value={sampleDeviceData.bloodOxygen} unit="%" description="From Google Fit" />
        <MetricCard icon={<Footprints className="w-6 h-6 text-green-500" />} title="Steps Today" value={sampleDeviceData.steps.toLocaleString()} description="From Google Fit" />
        <MetricCard icon={<Flame className="w-6 h-6 text-orange-500" />} title="Calories Burned" value={sampleDeviceData.calories.toLocaleString()} unit="kcal" description="From Google Fit" />
        <MetricCard icon={<Moon className="w-6 h-6 text-indigo-500" />} title="Sleep" value={`${sampleDeviceData.sleep.hours}h ${sampleDeviceData.sleep.minutes}m`} description="Last night's sleep" />
        
        {/* Manually Entered or Lab Vitals */}
        <MetricCard 
          icon={<HeartPulse className="w-6 h-6 text-red-400" />} 
          title="Blood Pressure" 
          value={latestVitals?.bloodPressure ? `${latestVitals.bloodPressure.systolic}/${latestVitals.bloodPressure.diastolic}` : '--'} 
          unit="mmHg" 
          description={latestVitals?.date ? `Last on ${format(new Date(latestVitals.date), 'MMM d')}` : "No data yet"}
        />
        <MetricCard 
          icon={<Thermometer className="w-6 h-6 text-amber-500" />} 
          title="Body Temp" 
          value={latestVitals?.bodyTemperature ?? '--'} 
          unit="°F" 
          description={latestVitals?.date ? `Last on ${format(new Date(latestVitals.date), 'MMM d')}` : "No data yet"}
        />

        {/* Test Results */}
        <MetricCard 
          icon={<BrainCircuit className="w-6 h-6 text-purple-500" />} 
          title="Response Time" 
          value={latestResponseTimeTest ? Math.round(latestResponseTimeTest.average) : '--'} 
          unit="ms" 
          description={latestResponseTimeTest ? `Tested on ${format(new Date(latestResponseTimeTest.date), 'MMM d')}` : "No data yet"}
          href="/response-time"
        />
        <MetricCard 
          icon={<Eye className="w-6 h-6 text-emerald-500" />} 
          title="Vision Test" 
          value={latestEyeTest?.score ?? '--'}
          description={latestEyeTest ? `Tested on ${format(new Date(latestEyeTest.date), 'MMM d')}` : "No data yet"}
          href="/eye-test"
        />
        <MetricCard 
          icon={<Ear className="w-6 h-6 text-blue-500" />} 
          title="Hearing Test" 
          value="Normal"
          description={latestHearingTest ? `Tested on ${format(new Date(latestHearingTest.date), 'MMM d')}` : "No data yet"}
          href="/hearing-test"
        />

        {/* Add New Log */}
        <Dialog>
          <DialogTrigger asChild>
            <Card className="flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors">
              <PlusCircle className="h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="font-semibold text-muted-foreground">Log Manual Vitals</h3>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log New Vital Signs</DialogTitle>
              <DialogDescription>Record your current health metrics. Only fill what you've measured.</DialogDescription>
            </DialogHeader>
            {/* Form can be placed here */}
            <p className="text-center text-muted-foreground py-8">Manual entry form would go here.</p>
          </DialogContent>
        </Dialog>
         <Card className="flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors" asChild>
             <Link href="/connect-devices">
                <Watch className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="font-semibold text-muted-foreground">Connect a Device</h3>
             </Link>
        </Card>
      </div>
    </div>
  );
}
