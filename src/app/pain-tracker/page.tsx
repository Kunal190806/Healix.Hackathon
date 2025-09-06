import PainTracker from "@/components/pain-tracker";

export default function PainTrackerPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Chronic Pain Tracker</h1>
        <p className="text-muted-foreground mt-2">
          Log pain episodes and related symptoms to identify patterns and share insights with your doctor.
        </p>
      </header>
      <PainTracker />
    </div>
  );
}
