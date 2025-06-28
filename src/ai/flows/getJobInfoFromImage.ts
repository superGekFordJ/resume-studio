'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Input schema for the flow
const JobInfoFromImageInputSchema = z.object({
  imageBase64: z.string().describe('A Base64 encoded image of a job posting.'),
});
type JobInfoFromImageInput = z.infer<typeof JobInfoFromImageInputSchema>;


const getJobInfoFromImagePrompt = ai.definePrompt(
  {
    name: 'getJobInfoFromImagePrompt',
    input: { schema: JobInfoFromImageInputSchema },
    output: { schema: z.string() },
    prompt: (input: JobInfoFromImageInput) => ([
      {
        text: `You are an expert HR assistant. From the provided screenshot of a job posting, your task is to extract ONLY the most critical information. Ignore all website navigation, ads, sidebars, and other irrelevant text. Return a clean text block containing only these sections: 1. Job Title, 2. Company Name, 3. Key Responsibilities, 4. Required Skills and Qualifications.`
      },
      {
        media: {
          url: `data:image/png;base64,${input.imageBase64}`,
          contentType: 'image/png',
        },
      },
    ] as any[]),
    config: {
      temperature: 0.1,
    },
  },
);

export const getJobInfoFromImage = ai.defineFlow(
  {
    name: 'getJobInfoFromImageFlow',
    inputSchema: JobInfoFromImageInputSchema,
    outputSchema: z.string(),
  },
  async (input: JobInfoFromImageInput) => {
    const { output } = await getJobInfoFromImagePrompt(input);
    if (output === null || output === undefined) {
      throw new Error('AI failed to extract text from image. The output was empty.');
    }
    return output;
  }
); 