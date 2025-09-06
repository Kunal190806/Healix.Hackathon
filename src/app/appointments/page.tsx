
import MyAppointments from "@/components/my-appointments";

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">My Appointments</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your upcoming and past doctor consultations.
        </p>
      </header>
      <MyAppointments />
    </div>
  );
}
