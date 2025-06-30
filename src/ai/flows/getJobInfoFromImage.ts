'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { JobInfoFromImageInputSchema } from '../prompts/schemas';

type JobInfoFromImageInput = z.infer<typeof JobInfoFromImageInputSchema>;

export const getJobInfoFromImage = ai.defineFlow(
  {
    name: 'getJobInfoFromImageFlow',
    inputSchema: JobInfoFromImageInputSchema,
    outputSchema: z.string().describe('The extracted job information.'),
  },
  async (input: JobInfoFromImageInput) => {
    const prompt = ai.prompt<typeof JobInfoFromImageInputSchema, z.ZodString>(
      'getJobInfoFromImage'
    );
    const { output } = await prompt(input);
    if (output === null || output === undefined) {
      throw new Error('AI failed to extract text from image. The output was empty.');
    }
    return output;
  }
); 