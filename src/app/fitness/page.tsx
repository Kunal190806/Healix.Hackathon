import InclusiveFitness from "@/components/inclusive-fitness";

export default function FitnessPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Inclusive Fitness Platform</h1>
        <p className="text-muted-foreground mt-2">
          Find accessible fitness trainers and classes for people with disabilities, seniors, or special needs.
        </p>
      </header>
      <InclusiveFitness />
    </div>
  );
}
