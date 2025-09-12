
import EyeTest from "@/components/eye-test";

export default function EyeTestPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Visual Acuity Test</h1>
        <p className="text-muted-foreground mt-2">
          A simple screening to get an idea of your vision.
        </p>
      </header>
      <EyeTest />
    </div>
  );
}
