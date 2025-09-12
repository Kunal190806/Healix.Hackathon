
'use client';
import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, Pill, Droplets, Users, UtensilsCrossed, BookHeart, Dumbbell, PanelLeft, Hospital, UserPlus, Stethoscope, HeartPulse, ShieldCheck, CalendarDays, LogOut, Ear, Eye, Timer } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { Inter, Exo_2 } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const exo2 = Exo_2({
  subsets: ['latin'],
  weight: '700',
  variable: '--font-logo',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/hospitals', label: 'Find a Hospital', icon: Hospital },
    { href: '/doctors', label: 'Find a Doctor', icon: Stethoscope },
    { href: '/appointments', label: 'My Appointments', icon: CalendarDays },
    { href: '/meal-planner', label: 'AI Meal Planner', icon: UtensilsCrossed },
    { href: '/prescriptions', label: 'Prescriptions', icon: Pill },
    { href: '/vitals-tracker', label: 'Vitals Tracker', icon: HeartPulse },
    { href: '/hearing-test', label: 'Hearing Test', icon: Ear },
    { href: '/eye-test', label: 'Eye Test', icon: Eye },
    { href: '/response-time', label: 'Response Time Test', icon: Timer },
    { href: '/journal', label: 'Mental Health Journal', icon: BookHeart },
    { href: '/support-groups', label: 'Support Groups', icon: Users },
    { href: '/blood-donors', label: 'Blood Donors', icon: Droplets },
    { href: '/fitness', label: 'Inclusive Fitness', icon: Dumbbell },
    { href: '/caregiver-hub', label: 'Caregiver Hub', icon: ShieldCheck },
  ];

  return (
    <html lang="en" className="dark">
      <body className={cn(inter.variable, exo2.variable, "font-body antialiased")}>
        <SidebarProvider>
          <Sidebar collapsible="icon">
            <SidebarHeader>
              <div className="flex items-center justify-center p-2 h-14 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0 transition-all duration-200">
                <span className="text-lg font-logo font-bold group-data-[collapsible=icon]:hidden">HEALIX</span>
                <span className="text-2xl font-logo font-bold hidden group-data-[collapsible=icon]:block">H</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <Button
                      variant={pathname === item.href ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href={item.href}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Link>
                    </Button>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <header className="flex items-center justify-between mb-4 p-4 sm:p-6 lg:p-8 lg:pb-0">
                <div className="flex items-center gap-2 md:hidden">
                    <span className="text-lg font-logo font-bold">HEALIX</span>
                </div>
                 <div className="flex items-center gap-2 ml-auto">
                    {!isLoading && (
                      user ? (
                        <Button variant="outline" onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      ) : (
                        <Button variant="outline" asChild>
                          <Link href="/signup">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Sign Up
                          </Link>
                        </Button>
                      )
                    )}
                    <div className="md:hidden">
                      <SidebarTrigger>
                          <PanelLeft />
                      </SidebarTrigger>
                    </div>
                 </div>
            </header>
            <main className="min-h-screen p-4 sm:p-6 lg:p-8 pt-0 lg:pt-8">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
