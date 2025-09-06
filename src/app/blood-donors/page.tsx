import BloodDonorConnector from "@/components/blood-donor-connector";

export default function BloodDonorsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Blood Donor Connector</h1>
        <p className="text-muted-foreground mt-2">
          Connect with nearby donors for urgent blood requests or register to save lives.
        </p>
      </header>
      <BloodDonorConnector />
    </div>
  );
}
