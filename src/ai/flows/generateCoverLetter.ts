'use server';

/**
 * @fileOverview AI-powered cover letter generation tool.
 *
 * This file defines a Genkit flow for generating a personalized cover letter based on a user's resume
 * and target job information. It exports:
 *   - `generateCoverLetter`: An async function to trigger the cover letter generation flow.
 *   - `GenerateCoverLetterInput`: The TypeScript interface defining the input schema for the flow.
 *   - `GenerateCoverLetterOutput`: The TypeScript interface defining the output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  GenerateCoverLetterInputSchema,
  GenerateCoverLetterOutputSchema,
} from '../prompts/schemas';

export type GenerateCoverLetterInput = z.infer<
  typeof GenerateCoverLetterInputSchema
>;

export type GenerateCoverLetterOutput = z.infer<
  typeof GenerateCoverLetterOutputSchema
>;

// Exported function to call the flow.
export async function generateCoverLetter(
  input: GenerateCoverLetterInput
): Promise<GenerateCoverLetterOutput> {
  return generateCoverLetterFlow(input);
}

// Define the Genkit flow for generating a cover letter.
const generateCoverLetterFlow = ai.defineFlow(
  {
    name: 'generateCoverLetterFlow',
    inputSchema: GenerateCoverLetterInputSchema,
    outputSchema: GenerateCoverLetterOutputSchema,
  },
  async input => {
    const prompt = ai.prompt<
      typeof GenerateCoverLetterInputSchema,
      typeof GenerateCoverLetterOutputSchema
    >('generate-cover-letter');
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Cover letter generation failed to produce an output.');
    }
    return output;
  }
); 