
'use client';

import dynamic from 'next/dynamic';

const ProfileDisplay = dynamic(() => import('@/components/profile-display'), {
  ssr: false,
  loading: () => <div className="h-96 w-full flex justify-center items-center"><p>Loading profile...</p></div>,
});


export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your account details.
        </p>
      </header>
      <ProfileDisplay />
    </div>
  );
}
