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

import { aiManager } from '@/ai/AIManager';
import { z } from 'genkit';
import {
  GenerateCoverLetterInputSchema,
  GenerateCoverLetterOutputSchema,
} from '../prompts/schemas';
import _ from 'lodash';

export type GenerateCoverLetterInput = z.infer<
  typeof GenerateCoverLetterInputSchema
>;

export type GenerateCoverLetterOutput = z.infer<
  typeof GenerateCoverLetterOutputSchema
>;

const flowCache = new Map<string, any>();

// Exported function to call the flow.
export async function generateCoverLetter(
  input: GenerateCoverLetterInput
): Promise<GenerateCoverLetterOutput> {
  const cacheKey = JSON.stringify(_.pick(input.aiConfig, ['provider', 'apiKey']));
  let generateCoverLetterFlow = flowCache.get(cacheKey);

  if (!generateCoverLetterFlow) {
    const ai = aiManager.getGenkit(input.aiConfig);
    generateCoverLetterFlow = ai.defineFlow(
      {
        name: `generateCoverLetterFlow_${flowCache.size}`,
        inputSchema: GenerateCoverLetterInputSchema,
        outputSchema: GenerateCoverLetterOutputSchema,
      },
      async (flowInput) => {
        const prompt = ai.prompt<
          typeof GenerateCoverLetterInputSchema,
          typeof GenerateCoverLetterOutputSchema
        >('generate-cover-letter');
        const { output } = await prompt(flowInput);
        if (!output) {
          throw new Error('Cover letter generation failed to produce an output.');
        }
        return output;
      }
    );
    flowCache.set(cacheKey, generateCoverLetterFlow);
  }
  
  return generateCoverLetterFlow(input);
}