'use server';

/**
 * @fileOverview AI-powered job info extraction from image tool.
 *
 * This file defines a Genkit flow for extracting job information from an image.
 * It exports:
 *   - `getJobInfoFromImage`: An async function to trigger the job info extraction flow.
 *   - `JobInfoFromImageInput`: The TypeScript interface defining the input schema for the flow.
 *   - `JobInfoFromImageOutput`: The TypeScript interface defining the output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  JobInfoFromImageInputSchema,
  JobInfoFromImageOutputSchema,
} from '../prompts/schemas';

type JobInfoFromImageInput = z.infer<typeof JobInfoFromImageInputSchema>;

export const getJobInfoFromImage = ai.defineFlow(
  {
    name: 'getJobInfoFromImageFlow',
    inputSchema: JobInfoFromImageInputSchema,
    outputSchema: z.string().describe('The extracted job information.'),
  },
  async (input: JobInfoFromImageInput) => {
    const prompt = ai.prompt<
      typeof JobInfoFromImageInputSchema,
      typeof JobInfoFromImageOutputSchema
    >('getJobInfoFromImage');
    const result = await prompt(input);
    const output = result.output;

    if (!output?.extractedText) {
      // The detailed log is no longer needed. A concise error with the reason is better.
      throw new Error(
        `AI failed to extract text from image. Finish Reason: ${result.finishReason}.`
      );
    }
    return output.extractedText;
  }
);
