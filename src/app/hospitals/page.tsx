import HospitalFinder from "@/components/hospital-finder";

export default function HospitalsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Nearby Specialist Hospital Finder</h1>
        <p className="text-muted-foreground mt-2">
          Find the right hospital based on your condition and location.
        </p>
      </header>
      <HospitalFinder />
    </div>
  );
}
