import dynamic from 'next/dynamic';

const SignUpForm = dynamic(() => import('@/components/signup-form'), {
  ssr: false,
  loading: () => <p>Loading form...</p>
});

export default function SignUpPage() {
  return (
    <div className="space-y-6">
       <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Create Your Account</h1>
        <p className="text-muted-foreground mt-2">
          Join HEALIX and take control of your health journey. Select your role to get started.
        </p>
      </header>
      <SignUpForm />
    </div>
  );
}
