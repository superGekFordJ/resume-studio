'use server';

/**
 * @fileOverview Provides an AI-powered resume review flow.
 *
 * - reviewResume -  A function that accepts a resume as a string and returns a review with suggestions.
 * - ReviewResumeInput - The input type for the reviewResume function.
 * - ReviewResumeOutput - The return type for the reviewResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReviewResumeInputSchema = z.object({
  resumeText: z.string().describe('The complete text content of the resume to be reviewed.'),
});
export type ReviewResumeInput = z.infer<typeof ReviewResumeInputSchema>;

const ReviewResumeOutputSchema = z.object({
  overallQuality: z.string().describe('An overall assessment of the resume quality.'),
  suggestions: z
    .string()
    .describe('Specific, actionable suggestions for improving the resume.'),
});
export type ReviewResumeOutput = z.infer<typeof ReviewResumeOutputSchema>;

export async function reviewResume(input: ReviewResumeInput): Promise<ReviewResumeOutput> {
  return reviewResumeFlow(input);
}

const reviewResumePrompt = ai.definePrompt({
  name: 'reviewResumePrompt',
  input: {schema: ReviewResumeInputSchema},
  output: {schema: ReviewResumeOutputSchema},
  prompt: `You are an expert resume reviewer. Analyze the following resume text and provide an overall quality assessment and specific suggestions for improvement.

Resume Text:
{{{resumeText}}}

Respond in a professional and helpful tone.`,
  model: 'googleai/gemini-2.5-flash-lite-06-17',
  config: {
    temperature: 0.2,
    maxOutputTokens: 2048,
    topP: 0.9
  }
});

const reviewResumeFlow = ai.defineFlow(
  {
    name: 'reviewResumeFlow',
    inputSchema: ReviewResumeInputSchema,
    outputSchema: ReviewResumeOutputSchema,
  },
  async input => {
    const {output} = await reviewResumePrompt(input);
    return output!;
  }
);
