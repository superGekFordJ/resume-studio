'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  AIGeneratedResumeDataSchema,
  GenerateResumeContextInputSchema,
} from '../prompts/schemas';

export type AIGeneratedResumeData = z.infer<
  typeof AIGeneratedResumeDataSchema
>;
type GenerateResumeContextInput = z.infer<
  typeof GenerateResumeContextInputSchema
>;

export const generateResumeFromContext = ai.defineFlow(
  {
    name: 'generateResumeFromContextFlow',
    inputSchema: GenerateResumeContextInputSchema,
    outputSchema: AIGeneratedResumeDataSchema,
  },
  async (input: GenerateResumeContextInput) => {
    const prompt = ai.prompt<
      typeof GenerateResumeContextInputSchema,
      typeof AIGeneratedResumeDataSchema
    >('generateResumeFromContext');
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a resume. The output was empty.');
    }
    return output;
  }
); 