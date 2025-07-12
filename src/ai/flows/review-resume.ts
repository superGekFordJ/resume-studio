'use server';

/**
 * @fileOverview Provides an AI-powered resume review flow.
 *
 * - reviewResume -  A function that accepts a resume as a string and returns a review with suggestions.
 * - ReviewResumeInput - The input type for the reviewResume function.
 * - ReviewResumeOutput - The return type for the reviewResume function.
 */

import { aiManager } from '@/ai/AIManager';
import { z } from 'genkit';
import { 
  ResumeReviewInputSchema, 
  ResumeReviewOutputSchema 
} from '../prompts/schemas';

export type ReviewResumeInput = z.infer<typeof ResumeReviewInputSchema>;
export type ReviewResumeOutput = z.infer<typeof ResumeReviewOutputSchema>;

export async function reviewResume(input: ReviewResumeInput): Promise<ReviewResumeOutput> {
  const ai = aiManager.getGenkit(input.aiConfig);

  const reviewResumeFlow = ai.defineFlow(
    {
      name: 'reviewResumeFlow',
      inputSchema: ResumeReviewInputSchema,
      outputSchema: ResumeReviewOutputSchema,
    },
    async (flowInput) => {
      const prompt = ai.prompt<
        typeof ResumeReviewInputSchema,
        typeof ResumeReviewOutputSchema
      >('reviewResume');

      const { output } = await prompt(flowInput);
      
      if (!output) {
        throw new Error('Resume review failed to produce an output.');
      }
      return output;
    }
  );
  
  return reviewResumeFlow(input);
}
