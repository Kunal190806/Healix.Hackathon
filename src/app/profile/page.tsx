
import ProfileDisplay from "@/components/profile-display";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your account details.
        </p>
      </header>
      <ProfileDisplay />
    </div>
  );
}
