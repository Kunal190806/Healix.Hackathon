import PrescriptionManager from "@/components/prescription-manager";

export default function PrescriptionsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Smart Prescription Manager</h1>
        <p className="text-muted-foreground mt-2">
          Keep track of your medications, dosages, and schedules all in one place.
        </p>
      </header>
      <PrescriptionManager />
    </div>
  );
}
