'use client';

import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getMealSuggestions } from '@/app/meal-planner/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  dietaryRestrictions: z.string().min(2, { message: 'Please enter your dietary restrictions (e.g., vegetarian, gluten-free).' }),
  cuisinePreferences: z.string().min(2, { message: 'Please enter your cuisine preferences (e.g., Italian, Mexican).' }),
  calorieGoals: z.string().min(2, { message: 'Please enter your calorie goals (e.g., 500-700 calories).' }),
});

export default function MealPlannerForm() {
  const { toast } = useToast();
  const [formState, formAction] = useFormState(getMealSuggestions, { message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dietaryRestrictions: '',
      cuisinePreferences: '',
      calorieGoals: '',
    },
  });

  useEffect(() => {
    setIsLoading(false);
    if (formState.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate meal ideas. Please check your input and try again.',
      });
    }
  }, [formState, toast]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formAction(formData);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="dietaryRestrictions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dietary Restrictions</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., vegetarian, gluten-free, no nuts" {...field} />
                </FormControl>
                <FormDescription>List any allergies or dietary needs, separated by commas.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cuisinePreferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuisine Preferences</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Italian, Mexican, Thai" {...field} />
                </FormControl>
                <FormDescription>What types of food do you enjoy?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="calorieGoals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calorie Goals per Meal</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 400-600 calories" {...field} />
                </FormControl>
                <FormDescription>Enter your target calorie range for each meal.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Get Suggestions'
            )}
          </Button>
        </form>
      </Form>

      {isLoading && (
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
            <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Our AI is preparing your meal ideas...</p>
            </div>
        </div>
      )}

      {formState?.mealIdeas && formState.mealIdeas.length > 0 && (
        <div>
          <h2 className="text-2xl font-headline font-semibold mb-4">Your Meal Ideas</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {formState.mealIdeas.map((idea, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader className="flex-row items-center gap-4">
                  <Utensils className="h-8 w-8 text-accent" />
                  <CardTitle>{idea}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {formState?.error && !isLoading && (
        <div className="flex items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-12">
            <div className="text-center text-destructive">
                <AlertCircle className="mx-auto h-12 w-12" />
                <p className="mt-4 font-semibold">Oops! Something went wrong.</p>
                <p className="mt-2 text-sm">{typeof formState.error === 'string' ? formState.error : 'Please try again.'}</p>
            </div>
        </div>
      )}
    </div>
  );
}
