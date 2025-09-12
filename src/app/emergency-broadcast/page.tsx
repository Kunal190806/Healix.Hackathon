
import EmergencyBroadcast from "@/components/emergency-broadcast";

export default function EmergencyBroadcastPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Emergency Broadcast</h1>
        <p className="text-muted-foreground mt-2">
          Alert nearby community responders when an ambulance is unavailable.
        </p>
      </header>
      <EmergencyBroadcast />
    </div>
  );
}
