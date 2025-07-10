'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { JobInfoFromImageInputSchema, JobInfoFromImageOutputSchema } from '../prompts/schemas';

type JobInfoFromImageInput = z.infer<typeof JobInfoFromImageInputSchema>;
type JobInfoFromImageOutput = z.infer<typeof JobInfoFromImageOutputSchema>;

export const getJobInfoFromImage = ai.defineFlow(
  {
    name: 'getJobInfoFromImageFlow',
    inputSchema: JobInfoFromImageInputSchema,
    outputSchema: z.string().describe('The extracted job information.'),
  },
  async (input: JobInfoFromImageInput) => {
    const prompt = ai.prompt<typeof JobInfoFromImageInputSchema, typeof JobInfoFromImageOutputSchema>(
      'getJobInfoFromImage'
    );
    const result = await prompt(input);
    const output = result.output;

    if (!output?.extractedText) {
      // The detailed log is no longer needed. A concise error with the reason is better.
      throw new Error(`AI failed to extract text from image. Finish Reason: ${result.finishReason}.`);
    }
    return output.extractedText;
  }
); 