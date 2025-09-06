import PeerSupportGroup from "@/components/peer-support-group";

export default function SupportGroupsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Anonymous Peer-Support Groups</h1>
        <p className="text-muted-foreground mt-2">
          A judgment-free space for mental health discussions. Your identity remains anonymous.
        </p>
      </header>
      <PeerSupportGroup />
    </div>
  );
}
