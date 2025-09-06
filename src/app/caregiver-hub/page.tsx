import CaregiverHub from "@/components/caregiver-hub";

export default function CaregiverHubPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Caregiver Hub</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your loved one's health, adherence, and appointments.
        </p>
      </header>
      <CaregiverHub />
    </div>
  );
}
