
import ConnectDevices from "@/components/connect-devices";

export default function ConnectDevicesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Connect Health Devices</h1>
        <p className="text-muted-foreground mt-2">
          Sync your vitals automatically from your smart watch or health band via Google Fit.
        </p>
      </header>
      <ConnectDevices />
    </div>
  );
}
