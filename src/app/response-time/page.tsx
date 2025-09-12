
import ResponseTimeTester from "@/components/response-time-tester";

export default function ResponseTimePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Response Time Test</h1>
        <p className="text-muted-foreground mt-2">
          Measure your reaction time. This test can be a simple indicator of cognitive processing speed.
        </p>
      </header>
      <ResponseTimeTester />
    </div>
  );
}

