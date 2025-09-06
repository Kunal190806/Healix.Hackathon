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
      'A comma-separated list of dietary restrictions and allergies, e.g., gluten-free, dairy-free, vegetarian, no peanuts.'
    ),
  cuisinePreferences: z
    .string()
    .describe('Preferred cuisines, e.g., Italian, Mexican, Indian.'),
  calorieGoals: z
    .string()
    .describe('Calorie goals for the meals, e.g., 500-600 calories.'),
});
export type SuggestMealIdeasInput = z.infer<typeof SuggestMealIdeasInputSchema>;

const MealIdeaSchema = z.object({
  name: z.string().describe('The name of the meal.'),
  description: z.string().describe('A short, enticing description of the meal.'),
  calories: z.number().describe('The estimated number of calories per serving.'),
});

const SuggestMealIdeasOutputSchema = z.object({
  mealIdeas: z
    .array(MealIdeaSchema)
    .describe('A list of 5 meal ideas that match the dietary restrictions and preferences.'),
});
export type SuggestMealIdeasOutput = z.infer<typeof SuggestMealIdeasOutputSchema>;
export type MealIdea = z.infer<typeof MealIdeaSchema>;


export async function suggestMealIdeas(input: SuggestMealIdeasInput): Promise<SuggestMealIdeasOutput> {
  return suggestMealIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMealIdeasPrompt',
  input: {schema: SuggestMealIdeasInputSchema},
  output: {schema: SuggestMealIdeasOutputSchema},
  prompt: `You are an expert nutritionist and chef. Suggest 5 meal ideas based on the following dietary restrictions, cuisine preferences, and calorie goals.

Dietary Restrictions: {{{dietaryRestrictions}}}
Cuisine Preferences: {{{cuisinePreferences}}}
Calorie Goals: {{{calorieGoals}}}

For each meal idea, provide:
1.  A creative and appealing name for the meal.
2.  A short (1-2 sentence) description.
3.  An estimated calorie count per serving that fits within the user's goals.

Ensure that each meal idea strictly adheres to all specified dietary needs and restrictions. For example, if the user specifies "no nuts," none of the meal suggestions should contain nuts.

Return the response in a valid JSON format.`,
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
