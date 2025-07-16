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

import { aiManager } from '@/ai/AIManager';
import { z } from 'genkit';
import {
  ImproveResumeSectionInputSchema,
  ImproveResumeSectionOutputSchema,
} from '../prompts/schemas';
import _ from 'lodash';

export type ImproveResumeSectionInput = z.infer<
  typeof ImproveResumeSectionInputSchema
>;

export type ImproveResumeSectionOutput = z.infer<
  typeof ImproveResumeSectionOutputSchema
>;

const flowCache = new Map<string, any>();

// Exported function to call the flow.
export async function improveResumeSection(
  input: ImproveResumeSectionInput
): Promise<ImproveResumeSectionOutput> {
  const cacheKey = JSON.stringify(_.pick(input.aiConfig, ['provider', 'apiKey']));
  let improveResumeSectionFlow = flowCache.get(cacheKey);
  
  if (!improveResumeSectionFlow) {
    const ai = aiManager.getGenkit(input.aiConfig);
    improveResumeSectionFlow = ai.defineFlow(
      {
        name: `improveResumeSectionFlow_${flowCache.size}`,
        inputSchema: ImproveResumeSectionInputSchema,
        outputSchema: ImproveResumeSectionOutputSchema,
      },
      async (flowInput) => {
        const prompt = ai.prompt<
          typeof ImproveResumeSectionInputSchema,
          typeof ImproveResumeSectionOutputSchema
        >('improveResumeSection');
        const { output } = await prompt(flowInput);
        if (!output) {
          throw new Error('Improve resume section failed to produce an output.');
        }
        return output;
      }
    );
    flowCache.set(cacheKey, improveResumeSectionFlow);
  }

  return improveResumeSectionFlow(input);
}
