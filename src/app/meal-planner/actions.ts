'use server';

import { suggestMealIdeas, SuggestMealIdeasInput, SuggestMealIdeasOutput, MealIdea } from '@/ai/flows/suggest-meal-ideas';
import { z } from 'zod';

const SuggestMealIdeasSchema = z.object({
  dietaryRestrictions: z.string().min(1, 'Please specify your dietary restrictions.'),
  allergies: z.string(),
  cuisinePreferences: z.string().min(1, 'Please specify at least one cuisine preference.'),
  calorieGoals: z.string().min(1, 'Please specify your calorie goals.'),
});

export async function getMealSuggestions(
  prevState: any,
  formData: FormData
): Promise<{ message: string; mealIdeas?: MealIdea[]; error?: any }> {
  const validatedFields = SuggestMealIdeasSchema.safeParse({
    dietaryRestrictions: formData.get('dietaryRestrictions'),
    allergies: formData.get('allergies'),
    cuisinePreferences: formData.get('cuisinePreferences'),
    calorieGoals: formData.get('calorieGoals'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed.',
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result: SuggestMealIdeasOutput = await suggestMealIdeas(validatedFields.data as SuggestMealIdeasInput);
    return {
      message: 'Success!',
      mealIdeas: result.mealIdeas,
    };
  } catch (e) {
    console.error(e);
    return {
      message: 'An unexpected error occurred.',
      error: 'Failed to generate meal ideas. Please try again later.',
    };
  }
}
