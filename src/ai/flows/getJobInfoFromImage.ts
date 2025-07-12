'use server';
import { aiManager } from '@/ai/AIManager';
import { z } from 'genkit';
import { JobInfoFromImageInputSchema, JobInfoFromImageOutputSchema } from '../prompts/schemas';

type JobInfoFromImageInput = z.infer<typeof JobInfoFromImageInputSchema>;
type JobInfoFromImageOutput = z.infer<typeof JobInfoFromImageOutputSchema>;

export async function getJobInfoFromImage(
  input: JobInfoFromImageInput
): Promise<string> {
  const ai = aiManager.getGenkit(input.aiConfig);

  const getJobInfoFromImageFlow = ai.defineFlow(
    {
      name: 'getJobInfoFromImageFlow',
      inputSchema: JobInfoFromImageInputSchema,
      outputSchema: z.string().describe('The extracted job information.'),
    },
    async (flowInput: JobInfoFromImageInput) => {
      const prompt = ai.prompt<
        typeof JobInfoFromImageInputSchema,
        typeof JobInfoFromImageOutputSchema
      >('getJobInfoFromImage');
      const result = await prompt(flowInput);
      const output = result.output;

      if (!output?.extractedText) {
        // The detailed log is no longer needed. A concise error with the reason is better.
        throw new Error(`AI failed to extract text from image. Finish Reason: ${result.finishReason}.`);
      }
      return output.extractedText;
    }
  );
  
  return getJobInfoFromImageFlow(input);
} 