
import HearingTest from "@/components/hearing-test";

export default function HearingTestPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Hearing Test</h1>
        <p className="text-muted-foreground mt-2">
          A simple screening to test your ability to hear different frequencies.
        </p>
      </header>
      <HearingTest />
    </div>
  );
}
