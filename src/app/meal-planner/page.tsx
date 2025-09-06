import MealPlannerForm from "@/components/meal-planner-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MealPlannerPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">AI-Powered Meal Planner</h1>
        <p className="text-muted-foreground mt-2">
          Let our AI create adaptive weekly meal plans based on your dietary needs, allergies, and calorie goals.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Get Meal Suggestions</CardTitle>
          <CardDescription>Fill out the form below and our AI will generate meal ideas just for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <MealPlannerForm />
        </CardContent>
      </Card>
    </div>
  );
}
