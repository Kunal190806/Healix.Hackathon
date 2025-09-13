
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UtensilsCrossed, Pill, BookHeart, Users, Droplets, Dumbbell, ArrowRight, Hospital, Stethoscope, HeartPulse, ShieldCheck, CalendarDays, Ear, Eye, Timer, LogIn, UserPlus, Watch, Siren, ShoppingCart } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';
import { useLanguage } from '@/hooks/use-language';

const modules = [
    {
    titleKey: "emergency",
    icon: Siren,
    href: "/call-ambulance",
    color: "text-destructive",
  },
  {
    titleKey: "findHospital",
    icon: Hospital,
    href: "/hospitals",
    color: "text-cyan-500",
  },
  {
    titleKey: "findDoctor",
    icon: Stethoscope,
    href: "/doctors",
    color: "text-indigo-500",
  },
  {
    titleKey: "myAppointments",
    icon: CalendarDays,
    href: "/appointments",
    color: "text-blue-500",
  },
  {
    titleKey: "mealPlanner",
    icon: UtensilsCrossed,
    href: "/meal-planner",
    color: "text-green-500",
  },
  {
    titleKey: "prescriptionManager",
    icon: Pill,
    href: "/prescriptions",
    color: "text-blue-500",
  },
  {
    titleKey: "orderMedicines",
    icon: ShoppingCart,
    href: "/order-medicines",
    color: "text-sky-500",
  },
  {
    titleKey: "vitalsTracker",
    icon: HeartPulse,
    href: "/vitals-tracker",
    color: "text-red-500",
  },
  {
    titleKey: "responseTime",
    icon: Timer,
    href: "/response-time",
    color: "text-amber-500",
  },
    {
    titleKey: "eyeTest",
    icon: Eye,
    href: "/eye-test",
    color: "text-blue-400",
  },
  {
    titleKey: "hearingTest",
    icon: Ear,
    href: "/hearing-test",
    color: "text-fuchsia-400",
  },
  {
    titleKey: "connectDevices",
    icon: Watch,
    href: "/connect-devices",
    color: "text-slate-500",
  },
  {
    titleKey: "journal",
    icon: BookHeart,
    href: "/journal",
    color: "text-purple-500",
  },
  {
    titleKey: "supportGroups",
    icon: Users,
    href: "/support-groups",
    color: "text-yellow-500",
  },
  {
    titleKey: "bloodDonors",
    icon: Droplets,
    href: "/blood-donors",
    color: "text-pink-500",
  },
  {
    titleKey: "fitness",
    icon: Dumbbell,
    href: "/fitness",
    color: "text-orange-500",
  },
  {
    titleKey: "caregiverHub",
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
  const { t } = useLanguage();
  
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
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">{t('dashboard.welcomeGuest')}</h1>
        <p className="text-muted-foreground mt-4 max-w-xl">
          {t('dashboard.descriptionGuest')}
        </p>
        <div className="mt-8 flex gap-4">
            <Button size="lg" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-5 w-5"/>
                {t('dashboard.login')}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
                <Link href="/signup">
                  <UserPlus className="mr-2 h-5 w-5"/>
                  {t('dashboard.signup')}
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
          {t('dashboard.welcome')}
        </h1>
        <p className="text-muted-foreground mt-2">{t('dashboard.description')}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const title = t(`dashboard.modules.${module.titleKey}.title` as any);
          const description = t(`dashboard.modules.${module.titleKey}.description` as any);
          return (
          <Card key={module.titleKey} className="flex flex-col justify-between hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <module.icon className={`w-8 h-8 ${module.color}`} />
                <CardTitle className="font-headline">{title}</CardTitle>
              </div>
              <CardDescription className="pt-2">{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="ghost" className="w-full justify-start text-primary">
                <Link href={module.href}>
                  {t('dashboard.modules.goTo')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )})}
      </div>
    </div>
  );
}
