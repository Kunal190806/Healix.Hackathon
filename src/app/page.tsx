import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UtensilsCrossed, Pill, Activity, BookHeart, Users, Droplets, Dumbbell, ArrowRight } from 'lucide-react';

const modules = [
  {
    title: "AI Meal Planner",
    description: "Get personalized meal suggestions based on your dietary needs and preferences.",
    icon: UtensilsCrossed,
    href: "/meal-planner",
    color: "text-green-500",
  },
  {
    title: "Prescription Manager",
    description: "Track your medications and set reminders to stay on top of your health.",
    icon: Pill,
    href: "/prescriptions",
    color: "text-blue-500",
  },
  {
    title: "Chronic Pain Tracker",
    description: "Log and monitor your pain levels to identify patterns and triggers.",
    icon: Activity,
    href: "/pain-tracker",
    color: "text-red-500",
  },
  {
    title: "Mental Health Journal",
    description: "Record your thoughts and emotions to gain insights into your mental well-being.",
    icon: BookHeart,
    href: "/journal",
    color: "text-purple-500",
  },
  {
    title: "Peer-Support Groups",
    description: "Connect with others in anonymous, judgment-free discussion communities.",
    icon: Users,
    href: "/support-groups",
    color: "text-yellow-500",
  },
  {
    title: "Blood Donor Connector",
    description: "Find or register as a blood donor to help save lives in your community.",
    icon: Droplets,
    href: "/blood-donors",
    color: "text-pink-500",
  },
  {
    title: "Inclusive Fitness",
    description: "Discover accessible fitness trainers and classes tailored to your needs.",
    icon: Dumbbell,
    href: "/fitness",
    color: "text-orange-500",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Welcome to MediSync</h1>
        <p className="text-muted-foreground mt-2">Your all-in-one platform for a healthier, more connected life.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.title} className="flex flex-col justify-between hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <module.icon className={`w-8 h-8 ${module.color}`} />
                <CardTitle className="font-headline">{module.title}</CardTitle>
              </div>
              <CardDescription className="pt-2">{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="ghost" className="w-full justify-start text-primary">
                <Link href={module.href}>
                  Go to {module.title} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
