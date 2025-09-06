'use client';
import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, Pill, Droplets, Users, UtensilsCrossed, BookHeart, Activity, Dumbbell, PanelLeft, Hospital } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/logo';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';

// Metadata is not supported in client components, but we can keep this for static analysis
// export const metadata: Metadata = {
//   title: 'MediSync MVP',
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
    { href: '/meal-planner', label: 'AI Meal Planner', icon: UtensilsCrossed },
    { href: '/prescriptions', label: 'Prescriptions', icon: Pill },
    { href: '/pain-tracker', label: 'Pain Tracker', icon: Activity },
    { href: '/journal', label: 'Mental Health Journal', icon: BookHeart },
    { href: '/support-groups', label: 'Support Groups', icon: Users },
    { href: '/blood-donors', label: 'Blood Donors', icon: Droplets },
    { href: '/fitness', label: 'Inclusive Fitness', icon: Dumbbell },
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
              <div className="flex items-center gap-2 p-2">
                <Logo className="w-8 h-8 text-primary" />
                <span className="text-lg font-headline font-bold">MediSync</span>
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
            <main className="min-h-screen p-4 sm:p-6 lg:p-8">
              <div className="md:hidden flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                    <Logo className="w-8 h-8 text-primary" />
                    <span className="text-lg font-headline font-bold">MediSync</span>
                 </div>
                 <SidebarTrigger>
                    <PanelLeft />
                 </SidebarTrigger>
              </div>
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
