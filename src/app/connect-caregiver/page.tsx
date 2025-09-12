
import ConnectCaregiverForm from "@/components/connect-caregiver-form";

export default function ConnectCaregiverPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Connect to Patient Profile</h1>
        <p className="text-muted-foreground mt-2">
          Enter the one-time access code provided by the patient to link your accounts.
        </p>
      </header>
      <ConnectCaregiverForm />
    </div>
  );
}
