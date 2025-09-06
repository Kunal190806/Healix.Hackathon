'use client';
import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, Pill, Droplets, Users, UtensilsCrossed, BookHeart, Activity, Dumbbell, PanelLeft, Hospital, UserPlus, Stethoscope, HeartPulse, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

// Metadata is not supported in client components, but we can keep this for static analysis
// export const metadata: Metadata = {
//   title: 'HEALIX',
//   description: 'A comprehensive healthcare and wellness web application.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/hospitals', label: 'Find a Hospital', icon: Hospital },
    { href: '/doctors', label: 'Find a Doctor', icon: Stethoscope },
    { href: '/meal-planner', label: 'AI Meal Planner', icon: UtensilsCrossed },
    { href: '/prescriptions', label: 'Prescriptions', icon: Pill },
    { href: '/vitals-tracker', label: 'Vitals Tracker', icon: HeartPulse },
    { href: '/journal', label: 'Mental Health Journal', icon: BookHeart },
    { href: '/support-groups', label: 'Support Groups', icon: Users },
    { href: '/blood-donors', label: 'Blood Donors', icon: Droplets },
    { href: '/fitness', label: 'Inclusive Fitness', icon: Dumbbell },
    { href: '/caregiver-hub', label: 'Caregiver Hub', icon: ShieldCheck },
  ];

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          <Sidebar collapsible="icon">
            <SidebarHeader>
              <div className="flex items-center justify-center p-2 h-14 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0 transition-all duration-200">
                <span className="text-lg font-headline font-bold group-data-[collapsible=icon]:hidden">HEALIX</span>
                <span className="text-2xl font-headline font-bold hidden group-data-[collapsible=icon]:block">H</span>
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
                <div className="flex items-center gap-2">
                    <span className="text-lg font-headline font-bold">HEALIX</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                      <Link href="/signup">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Sign Up
                      </Link>
                    </Button>
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
