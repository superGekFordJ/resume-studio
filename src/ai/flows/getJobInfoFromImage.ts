'use server';
import { aiManager } from '@/ai/AIManager';
import { z } from 'genkit';
import { JobInfoFromImageInputSchema, JobInfoFromImageOutputSchema } from '../prompts/schemas';
import _ from 'lodash';

type JobInfoFromImageInput = z.infer<typeof JobInfoFromImageInputSchema>;
type JobInfoFromImageOutput = z.infer<typeof JobInfoFromImageOutputSchema>;

const flowCache = new Map<string, any>();

export async function getJobInfoFromImage(
  input: JobInfoFromImageInput
): Promise<string> {
  const cacheKey = JSON.stringify(_.pick(input.aiConfig, ['provider', 'apiKey']));
  let getJobInfoFromImageFlow = flowCache.get(cacheKey);

  if (!getJobInfoFromImageFlow) {
    const ai = aiManager.getGenkit(input.aiConfig);
    getJobInfoFromImageFlow = ai.defineFlow(
      {
        name: `getJobInfoFromImageFlow_${flowCache.size}`,
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
    flowCache.set(cacheKey, getJobInfoFromImageFlow);
  }
  
  return getJobInfoFromImageFlow(input);
}