import VitalsTracker from "@/components/vitals-tracker";

export default function VitalsTrackerPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Vitals Tracker</h1>
        <p className="text-muted-foreground mt-2">
          Log and visualize your key health metrics to identify trends and share insights with your doctor.
        </p>
      </header>
      <VitalsTracker />
    </div>
  );
}
