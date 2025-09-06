'use server';
/**
 * @fileOverview An AI flow to extract prescription details from an image.
 *
 * - extractPrescriptionDetails - A function that handles the prescription extraction process.
 * - ExtractPrescriptionDetailsInput - The input type for the extractPrescriptionDetails function.
 * - ExtractPrescriptionDetailsOutput - The return type for the extractPrescriptionDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractPrescriptionDetailsInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a prescription, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractPrescriptionDetailsInput = z.infer<typeof ExtractPrescriptionDetailsInputSchema>;

const ExtractPrescriptionDetailsOutputSchema = z.object({
  name: z.string().describe('The name of the medication.'),
  dosage: z.string().describe('The dosage of the medication, e.g., 10mg.'),
  frequency: z.string().describe('How often to take the medication, e.g., Once a day.'),
});
export type ExtractPrescriptionDetailsOutput = z.infer<typeof ExtractPrescriptionDetailsOutputSchema>;

export async function extractPrescriptionDetails(input: ExtractPrescriptionDetailsInput): Promise<ExtractPrescriptionDetailsOutput> {
  return extractPrescriptionDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractPrescriptionDetailsPrompt',
  input: {schema: ExtractPrescriptionDetailsInputSchema},
  output: {schema: ExtractPrescriptionDetailsOutputSchema},
  prompt: `You are an OCR and text extraction expert specializing in medical prescriptions. Your task is to analyze the provided image of a prescription and extract the key details.

You need to identify the following information and return it in a structured JSON format:
- The name of the medication.
- The dosage (e.g., "10mg", "1 tablet").
- The frequency (e.g., "Once a day", "Twice daily", "Every 6 hours").

The prescription may be in any language, so be prepared to handle multilingual text. If any information is unclear or missing, make your best inference but prioritize accuracy.

Image to analyze: {{media url=imageDataUri}}`,
});

const extractPrescriptionDetailsFlow = ai.defineFlow(
  {
    name: 'extractPrescriptionDetailsFlow',
    inputSchema: ExtractPrescriptionDetailsInputSchema,
    outputSchema: ExtractPrescriptionDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input, {model: 'googleai/gemini-1.5-flash-latest'});
    return output!;
  }
);
