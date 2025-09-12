
import PreArrivalInfo from "@/components/pre-arrival-info";

export default function PreArrivalInfoPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Pre-Arrival Information</h1>
        <p className="text-muted-foreground mt-2">
          Send the patient's critical details to the hospital ahead of your arrival.
        </p>
      </header>
      <PreArrivalInfo />
    </div>
  );
}
