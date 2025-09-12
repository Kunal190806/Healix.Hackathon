'use client';

import VitalsTracker from "@/components/vitals-tracker";

export default function VitalsTrackerPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Vitals Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          An overview of your key health metrics, synced from your devices and manual entries.
        </p>
      </header>
      <VitalsTracker />
    </div>
  );
}
