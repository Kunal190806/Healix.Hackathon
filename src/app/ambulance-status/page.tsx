
import AmbulanceStatus from "@/components/ambulance-status";

export default function AmbulanceStatusPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Ambulance Status</h1>
        <p className="text-muted-foreground mt-2">
          Track the real-time location and ETA of your dispatched ambulance.
        </p>
      </header>
      <AmbulanceStatus />
    </div>
  );
}
