
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UtensilsCrossed, Pill, BookHeart, Users, Droplets, Dumbbell, ArrowRight, Hospital, Stethoscope, HeartPulse, ShieldCheck, CalendarDays, Ear, Eye, Timer, LogIn, UserPlus, Watch, Siren } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';

const modules = [
    {
    title: "Emergency Hub",
    description: "Access ambulance, broadcast, and hospital notification services.",
    icon: Siren,
    href: "/call-ambulance",
    color: "text-destructive",
  },
  {
    title: "Find a Hospital",
    description: "Search for specialist hospitals based on your condition and location.",
    icon: Hospital,
    href: "/hospitals",
    color: "text-cyan-500",
  },
  {
    title: "Find a Doctor",
    description: "Search for doctors by specialization, location, and more.",
    icon: Stethoscope,
    href: "/doctors",
    color: "text-indigo-500",
  },
  {
    title: "My Appointments",
    description: "View and manage your upcoming and past doctor consultations.",
    icon: CalendarDays,
    href: "/appointments",
    color: "text-blue-500",
  },
  {
    title: "AI Meal Planner",
    description: "Get personalized meal suggestions based on your dietary needs and preferences.",
    icon: UtensilsCrossed,
    href: "/meal-planner",
    color: "text-green-500",
  },
  {
    title: "Prescription Manager",
    description: "Track your medications and set reminders to stay on top of your health.",
    icon: Pill,
    href: "/prescriptions",
    color: "text-blue-500",
  },
  {
    title: "Vitals Tracker",
    description: "Log and monitor key health metrics like blood pressure, sugar levels, and more.",
    icon: HeartPulse,
    href: "/vitals-tracker",
    color: "text-red-500",
  },
  {
    title: "Response Time Test",
    description: "Measure your reaction time with this simple cognitive test.",
    icon: Timer,
    href: "/response-time",
    color: "text-amber-500",
  },
  {
    title: "Connect Devices",
    description: "Sync your smart watch or health band to automatically track your vitals.",
    icon: Watch,
    href: "/connect-devices",
    color: "text-slate-500",
  },
  {
    title: "Mental Health Journal",
    description: "Record your thoughts and emotions to gain insights into your mental well-being.",
    icon: BookHeart,
    href: "/journal",
    color: "text-purple-500",
  },
  {
    title: "Peer-Support Groups",
    description: "Connect with others in anonymous, judgment-free discussion communities.",
    icon: Users,
    href: "/support-groups",
    color: "text-yellow-500",
  },
  {
    title: "Blood Donor Connector",
    description: "Find or register as a blood donor to help save lives in your community.",
    icon: Droplets,
    href: "/blood-donors",
    color: "text-pink-500",
  },
  {
    title: "Inclusive Fitness",
    description: "Discover accessible fitness trainers and classes tailored to your needs.",
    icon: Dumbbell,
    href: "/fitness",
    color: "text-orange-500",
  },
  {
    title: "Caregiver Hub",
    description: "Monitor a loved one's health, appointments, and medication adherence.",
    icon: ShieldCheck,
    href: "/caregiver-hub",
    color: "text-teal-500",
  },
];

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { userProfile, isLoading: isProfileLoading } = useProfile();
  
  const isLoading = isAuthLoading || isProfileLoading;

  useEffect(() => {
    if (!isLoading && !user) {
      // If not loading and not logged in, and not on a public page, redirect to login
      const publicPages = ['/login', '/signup'];
      if (!publicPages.includes(pathname)) {
        router.replace('/login');
      }
    }
  }, [user, userProfile, isLoading, router, pathname]);
  
  // Show a global loading screen while auth/profile is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If not logged in, show the public landing page.
  if (!user) {
    return (
       <div className="flex flex-col items-center justify-center text-center py-16 h-[80vh]">
        <div className="relative w-24 h-24 mb-4">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
            <div className="relative flex items-center justify-center w-full h-full bg-primary rounded-full">
                <HeartPulse className="h-12 w-12 text-primary-foreground" />
            </div>
        </div>
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">Welcome to HEALIX</h1>
        <p className="text-muted-foreground mt-4 max-w-xl">
          Your all-in-one platform for a healthier, more connected life. Please sign in or create an account to access your personalized health dashboard.
        </p>
        <div className="mt-8 flex gap-4">
            <Button size="lg" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-5 w-5"/>
                Log In
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
                <Link href="/signup">
                  <UserPlus className="mr-2 h-5 w-5"/>
                  Sign Up
                </Link>
            </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">
          {`Welcome, ${user.displayName || 'User'}`}
        </h1>
        <p className="text-muted-foreground mt-2">Your all-in-one platform for a healthier, more connected life.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.title} className="flex flex-col justify-between hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <module.icon className={`w-8 h-8 ${module.color}`} />
                <CardTitle className="font-headline">{module.title}</CardTitle>
              </div>
              <CardDescription className="pt-2">{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="ghost" className="w-full justify-start text-primary">
                <Link href={module.href}>
                  Go to {module.title} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
