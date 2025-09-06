import DoctorFinder from "@/components/doctor-finder";

export default function DoctorsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Find a Doctor</h1>
        <p className="text-muted-foreground mt-2">
          Search for a specialist that fits your needs.
        </p>
      </header>
      <DoctorFinder />
    </div>
  );
}
