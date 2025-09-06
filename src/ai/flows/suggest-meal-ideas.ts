'use server';

/**
 * @fileOverview Provides AI-powered meal suggestions based on user dietary restrictions and preferences.
 *
 * - suggestMealIdeas - A function that suggests meal ideas based on dietary needs and allergies.
 * - SuggestMealIdeasInput - The input type for the suggestMealIdeas function, including dietary restrictions and preferences.
 * - SuggestMealIdeasOutput - The return type for the suggestMealIdeas function, providing a list of meal ideas.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMealIdeasInputSchema = z.object({
  dietaryRestrictions: z
    .string()
    .describe(
      'A comma-separated list of dietary restrictions and allergies, e.g., gluten-free, dairy-free, vegetarian.'
    ),
  cuisinePreferences: z
    .string()
    .describe('Preferred cuisines, e.g., Italian, Mexican, Indian.'),
  calorieGoals: z
    .string()
    .describe('Calorie goals for the meals, e.g., 500-600 calories.'),
});
export type SuggestMealIdeasInput = z.infer<typeof SuggestMealIdeasInputSchema>;

const SuggestMealIdeasOutputSchema = z.object({
  mealIdeas: z
    .array(z.string())
    .describe('A list of meal ideas that match the dietary restrictions and preferences.'),
});
export type SuggestMealIdeasOutput = z.infer<typeof SuggestMealIdeasOutputSchema>;

export async function suggestMealIdeas(input: SuggestMealIdeasInput): Promise<SuggestMealIdeasOutput> {
  return suggestMealIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMealIdeasPrompt',
  input: {schema: SuggestMealIdeasInputSchema},
  output: {schema: SuggestMealIdeasOutputSchema},
  prompt: `Suggest 5 meal ideas based on the following dietary restrictions, cuisine preferences, and calorie goals. Return the meal ideas as a JSON array of strings.\n\nDietary Restrictions: {{{dietaryRestrictions}}}\nCuisine Preferences: {{{cuisinePreferences}}}\nCalorie Goals: {{{calorieGoals}}}\n\nEnsure that each meal idea aligns with the specified dietary needs and preferences. For example, if the user is vegetarian, only suggest vegetarian meals.\n\nOutput the meal ideas in a JSON array format: {"mealIdeas": ["Meal Idea 1", "Meal Idea 2", "Meal Idea 3", "Meal Idea 4", "Meal Idea 5"]}`,
});

const suggestMealIdeasFlow = ai.defineFlow(
  {
    name: 'suggestMealIdeasFlow',
    inputSchema: SuggestMealIdeasInputSchema,
    outputSchema: SuggestMealIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
