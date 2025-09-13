
'use client';
import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, Pill, Droplets, Users, UtensilsCrossed, BookHeart, Dumbbell, PanelLeft, Hospital, UserPlus, Stethoscope, HeartPulse, ShieldCheck, CalendarDays, LogOut, Ear, Eye, Timer, LogIn, UserCircle, Loader2, Link as LinkIcon, Search, TestTube, MessagesSquare, Watch, Siren, PhoneCall, TowerControl, ClipboardPlus, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { Inter, Exo_2 } from 'next/font/google';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth, AuthProvider } from '@/hooks/use-auth.tsx';
import { ProfileProvider, useProfile } from '@/hooks/use-profile.tsx';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const exo2 = Exo_2({
  subsets: ['latin'],
  weight: '700',
  variable: '--font-logo',
});

function UserNav() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  if(isLoading) {
    return null;
  }

  if (user) {
    return (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
              <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild>
        <Link href="/login">Log in</Link>
      </Button>
      <Button asChild>
        <Link href="/signup">Sign up</Link>
      </Button>
    </div>
  )

}

function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userProfile } = useProfile();
  
  const findMyItems = [
    { href: '/hospitals', label: 'Find a Hospital', icon: Hospital },
    { href: '/doctors', label: 'Find a Doctor', icon: Stethoscope },
    { href: '/appointments', label: 'My Appointments', icon: CalendarDays },
  ];

  const emergencyItems = [
    { href: '/call-ambulance', label: 'Call Ambulance', icon: PhoneCall },
    { href: '/ambulance-status', label: 'Ambulance Status', icon: TowerControl },
    { href: '/emergency-broadcast', label: 'Emergency Broadcast', icon: Users },
    { href: '/pre-arrival-info', label: 'Pre-Arrival Info', icon: ClipboardPlus },
  ];

  const testItems = [
    { href: '/response-time', label: 'Response Time Test', icon: Timer },
  ];

  const forumItems = [
    { href: '/journal', label: 'Mental Health Journal', icon: BookHeart },
    { href: '/support-groups', label: 'Support Groups', icon: Users },
    { href: '/blood-donors', label: 'Blood Donors', icon: Droplets },
    { href: '/fitness', label: 'Inclusive Fitness', icon: Dumbbell },
  ];

  const prescriptionItems = [
    { href: '/prescriptions', label: 'Manage Prescriptions', icon: ClipboardPlus },
    { href: '/order-medicines', label: 'Order Medicines', icon: ShoppingCart },
  ];
  
  const topLevelItems = [
    { href: '/vitals-tracker', label: 'Vitals Tracker', icon: HeartPulse },
    { href: '/meal-planner', label: 'AI Meal Planner', icon: UtensilsCrossed },
  ];

  const bottomLevelItems = [
     { href: '/connect-devices', label: 'Connect Devices', icon: Watch },
     { href: '/caregiver-hub', label: 'Caregiver Hub', icon: ShieldCheck },
  ];


  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <SidebarProvider>
      {!isAuthPage && (
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center justify-center p-2 h-14 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0 transition-all duration-200">
              <span className="text-lg font-logo font-bold group-data-[collapsible=icon]:hidden">HEALIX</span>
              <span className="text-2xl font-logo font-bold hidden group-data-[collapsible=icon]:block">H</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Button
                  variant={pathname === '/' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              </SidebarMenuItem>
              
              {topLevelItems.map((item) => (
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

              <Accordion type="multiple" className="w-full">
                 <AccordionItem value="find-my" className="border-none">
                  <AccordionTrigger className="hover:no-underline text-muted-foreground hover:text-foreground [&[data-state=open]]:text-foreground font-semibold text-sm py-2 px-3 rounded-md hover:bg-muted/50 w-full justify-start">
                    <div className="flex items-center">
                       <Search className="mr-2 h-4 w-4" />
                       Find My
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1">
                    <SidebarMenu className="ml-5 border-l border-border pl-3">
                      {findMyItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                          <Button
                            variant={pathname === item.href ? 'secondary' : 'ghost'}
                            className="w-full justify-start h-8"
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
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="prescriptions" className="border-none">
                  <AccordionTrigger className="hover:no-underline text-muted-foreground hover:text-foreground [&[data-state=open]]:text-foreground font-semibold text-sm py-2 px-3 rounded-md hover:bg-muted/50 w-full justify-start">
                    <div className="flex items-center">
                       <Pill className="mr-2 h-4 w-4" />
                       Prescriptions
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1">
                    <SidebarMenu className="ml-5 border-l border-border pl-3">
                      {prescriptionItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                          <Button
                            variant={pathname === item.href ? 'secondary' : 'ghost'}
                            className="w-full justify-start h-8"
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
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tests" className="border-none">
                   <AccordionTrigger className="hover:no-underline text-muted-foreground hover:text-foreground [&[data-state=open]]:text-foreground font-semibold text-sm py-2 px-3 rounded-md hover:bg-muted/50 w-full justify-start">
                    <div className="flex items-center">
                       <TestTube className="mr-2 h-4 w-4" />
                       Tests
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1">
                    <SidebarMenu className="ml-5 border-l border-border pl-3">
                      {testItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                          <Button
                            variant={pathname === item.href ? 'secondary' : 'ghost'}
                            className="w-full justify-start h-8"
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
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="forums" className="border-none">
                   <AccordionTrigger className="hover:no-underline text-muted-foreground hover:text-foreground [&[data-state=open]]:text-foreground font-semibold text-sm py-2 px-3 rounded-md hover:bg-muted/50 w-full justify-start">
                    <div className="flex items-center">
                       <MessagesSquare className="mr-2 h-4 w-4" />
                       Forums
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1">
                    <SidebarMenu className="ml-5 border-l border-border pl-3">
                      {forumItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                          <Button
                            variant={pathname === item.href ? 'secondary' : 'ghost'}
                            className="w-full justify-start h-8"
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
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="emergency" className="border-none">
                  <AccordionTrigger className="hover:no-underline text-destructive hover:text-destructive/90 [&[data-state=open]]:text-destructive font-semibold text-sm py-2 px-3 rounded-md hover:bg-destructive/10 w-full justify-start">
                    <div className="flex items-center">
                       <Siren className="mr-2 h-4 w-4" />
                       Emergency
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1">
                    <SidebarMenu className="ml-5 border-l border-destructive/50 pl-3">
                      {emergencyItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                          <Button
                            variant={pathname === item.href ? 'secondary' : 'ghost'}
                            className="w-full justify-start h-8"
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
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
               
              {bottomLevelItems.map((item) => (
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
      )}
      <SidebarInset>
        <div className={cn('min-h-screen', isAuthPage ? 'bg-background' : 'bg-background/50 backdrop-blur-lg')}>
          {!isAuthPage && (
            <header className="flex items-center justify-between mb-4 p-4 sm:p-6 lg:p-8 lg:pb-0 h-16 border-b">
                <div className="flex items-center gap-2">
                    <div className="md:hidden">
                      <SidebarTrigger>
                          <PanelLeft />
                      </SidebarTrigger>
                    </div>
                    <span className="text-lg font-logo font-bold md:hidden">HEALIX</span>
                </div>
                  <div className="flex items-center gap-4 ml-auto">
                    <UserNav />
                  </div>
            </header>
          )}
          <main className={cn(
            "min-h-screen",
            !isAuthPage && "p-4 sm:p-6 lg:p-8 pt-0 lg:pt-8"
          )}>
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.variable, exo2.variable, "font-body antialiased")}>
        <AuthProvider>
          <ProfileProvider>
            <AppLayout>{children}</AppLayout>
          </ProfileProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
