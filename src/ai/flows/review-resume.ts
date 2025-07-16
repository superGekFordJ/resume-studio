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
import _ from 'lodash';

export type ReviewResumeInput = z.infer<typeof ResumeReviewInputSchema>;
export type ReviewResumeOutput = z.infer<typeof ResumeReviewOutputSchema>;

const flowCache = new Map<string, any>();

export async function reviewResume(input: ReviewResumeInput): Promise<ReviewResumeOutput> {
  const cacheKey = JSON.stringify(_.pick(input.aiConfig, ['provider', 'apiKey']));
  let reviewResumeFlow = flowCache.get(cacheKey);

  if (!reviewResumeFlow) {
    const ai = aiManager.getGenkit(input.aiConfig);
    reviewResumeFlow = ai.defineFlow(
      {
        name: `reviewResumeFlow_${flowCache.size}`,
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
    flowCache.set(cacheKey, reviewResumeFlow);
  }
  
  return reviewResumeFlow(input);
}
