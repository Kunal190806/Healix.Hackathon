
import CallAmbulance from "@/components/call-ambulance";

export default function CallAmbulancePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-destructive">Call Ambulance</h1>
        <p className="text-muted-foreground mt-2">
          Request an ambulance to your current location immediately.
        </p>
      </header>
      <CallAmbulance />
    </div>
  );
}
