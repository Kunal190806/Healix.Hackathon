
'use client';
import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, Pill, Droplets, Users, UtensilsCrossed, BookHeart, Dumbbell, PanelLeft, Hospital, UserPlus, Stethoscope, HeartPulse, ShieldCheck, CalendarDays, LogOut, Ear, Eye, Timer, LogIn, UserCircle, Loader2 } from 'lucide-react';
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
import { ProfileProvider } from '@/hooks/use-profile.tsx';


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
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
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


const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    if (!isLoading && !user && !isPublicPage) {
      router.push('/login');
    }
  }, [user, isLoading, isPublicPage, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Prevent flicker on public pages
  if (isPublicPage && !user) {
    return <>{children}</>;
  }

  if (!user && !isPublicPage) {
    // This will be shown briefly before redirection
    return (
       <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};


function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/profile', label: 'Profile', icon: UserCircle },
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
      )}
      <SidebarInset>
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
            <AuthGuard>
              <AppLayout>{children}</AppLayout>
            </AuthGuard>
          </ProfileProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
