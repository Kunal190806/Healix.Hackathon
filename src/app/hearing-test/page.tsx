
import HearingTest from "@/components/hearing-test";

export default function HearingTestPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Integrated Hearing Test</h1>
        <p className="text-muted-foreground mt-2">
          Test your hearing across different frequencies and generate a report.
        </p>
      </header>
      <HearingTest />
    </div>
  );
}
