// src/ai/flows/improve-resume-section.ts
'use server';

/**
 * @fileOverview AI-powered resume section improvement tool.
 *
 * This file defines a Genkit flow for rewriting a specific section of a resume based on a user-provided prompt.
 * It exports:
 *   - `improveResumeSection`: An async function to trigger the resume section improvement flow.
 *   - `ImproveResumeSectionInput`: The TypeScript interface defining the input schema for the flow.
 *   - `ImproveResumeSectionOutput`: The TypeScript interface defining the output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  ImproveResumeSectionInputSchema,
  ImproveResumeSectionOutputSchema,
} from '../prompts/schemas';

export type ImproveResumeSectionInput = z.infer<
  typeof ImproveResumeSectionInputSchema
>;

export type ImproveResumeSectionOutput = z.infer<
  typeof ImproveResumeSectionOutputSchema
>;

// Exported function to call the flow.
export async function improveResumeSection(
  input: ImproveResumeSectionInput
): Promise<ImproveResumeSectionOutput> {
  return improveResumeSectionFlow(input);
}

// Define the Genkit flow for improving a resume section.
const improveResumeSectionFlow = ai.defineFlow(
  {
    name: 'improveResumeSectionFlow',
    inputSchema: ImproveResumeSectionInputSchema,
    outputSchema: ImproveResumeSectionOutputSchema,
  },
  async (input) => {
    const prompt = ai.prompt<
      typeof ImproveResumeSectionInputSchema,
      typeof ImproveResumeSectionOutputSchema
    >('improveResumeSection', { variant: '25pro' });
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Improve resume section failed to produce an output.');
    }
    return output;
  }
);
