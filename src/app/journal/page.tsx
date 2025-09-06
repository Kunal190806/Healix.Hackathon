import MentalHealthJournal from "@/components/mental-health-journal";

export default function JournalPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Smart Mental Health Journal</h1>
        <p className="text-muted-foreground mt-2">
          A private space to log your daily thoughts, emotions, and reflections.
        </p>
      </header>
      <MentalHealthJournal />
    </div>
  );
}
