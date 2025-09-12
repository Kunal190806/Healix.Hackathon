
'use client';

import dynamic from 'next/dynamic';

const LoginForm = dynamic(() => import('@/components/login-form'), {
  ssr: false,
  loading: () => <p>Loading form...</p>
});

export default function LoginPage() {
  return (
    <div className="space-y-6 max-w-md mx-auto">
       <header className="text-center">
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Welcome Back</h1>
        <p className="text-muted-foreground mt-2">
          Sign in to your HEALIX account to continue.
        </p>
      </header>
      <LoginForm />
    </div>
  );
}
