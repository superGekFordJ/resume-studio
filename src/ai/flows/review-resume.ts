'use server';

/**
 * @fileOverview Provides an AI-powered resume review flow.
 *
 * - reviewResume -  A function that accepts a resume as a string and returns a review with suggestions.
 * - ReviewResumeInput - The input type for the reviewResume function.
 * - ReviewResumeOutput - The return type for the reviewResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {ReviewResumeInputSchema, ReviewResumeOutputSchema} from '../prompts/schemas';

export type ReviewResumeInput = z.infer<typeof ReviewResumeInputSchema>;
export type ReviewResumeOutput = z.infer<typeof ReviewResumeOutputSchema>;

export async function reviewResume(input: ReviewResumeInput): Promise<ReviewResumeOutput> {
  return reviewResumeFlow(input);
}


const reviewResumeFlow = ai.defineFlow(
  {
    name: 'reviewResumeFlow',
    inputSchema: ReviewResumeInputSchema,
    outputSchema: ReviewResumeOutputSchema,
  },
  async input => {
    const prompt = ai.prompt<typeof ReviewResumeInputSchema, typeof ReviewResumeOutputSchema>('reviewResume');
    const {output} = await prompt(input);
    return output!;
  }
);
