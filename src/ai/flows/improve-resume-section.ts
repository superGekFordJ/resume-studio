
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

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the improveResumeSection flow.
const ImproveResumeSectionInputSchema = z.object({
  resumeSection: z
    .string()
    .describe('The text content of the resume section to be improved.'),
  prompt: z
    .string()
    .describe(
      'A prompt providing instructions on how to improve the resume section.'
    ),
  userJobTitle: z
    .string()
    .optional()
    .describe("The user's overall job title or target role from their personal details."),
  sectionType: z
    .string()
    .optional()
    .describe('The type of resume section/field being improved (e.g., "experience", "summary", "personalDetailsField").'),
  currentItemContext: z
    .string()
    .optional()
    .describe('Brief context of the current item being improved (e.g., "Job: Software Engineer", "Field: Full Name").'),
  otherSectionsContext: z
    .string()
    .optional()
    .describe('A brief summary of other relevant sections in the resume to provide broader context.'),
});

export type ImproveResumeSectionInput = z.infer<
  typeof ImproveResumeSectionInputSchema
>;

// Define the output schema for the improveResumeSection flow.
const ImproveResumeSectionOutputSchema = z.object({
  improvedResumeSection: z
    .string()
    .describe('The AI-rewritten and improved resume section.'),
});

export type ImproveResumeSectionOutput = z.infer<
  typeof ImproveResumeSectionOutputSchema
>;

// Exported function to call the flow.
export async function improveResumeSection(
  input: ImproveResumeSectionInput
): Promise<ImproveResumeSectionOutput> {
  return improveResumeSectionFlow(input);
}

// Define the prompt for the AI to rewrite the resume section.
const improveResumeSectionPrompt = ai.definePrompt({
  name: 'improveResumeSectionPrompt',
  input: {schema: ImproveResumeSectionInputSchema},
  output: {schema: ImproveResumeSectionOutputSchema},
  prompt: `You are an AI assistant helping a user improve a section of their resume.
{{#if userJobTitle}}The user's target role is '{{userJobTitle}}'.{{/if}}
{{#if sectionType}}They are working on the '{{sectionType}}' section/field.{{/if}}
{{#if currentItemContext}}The specific item context is: {{currentItemContext}}.{{/if}}

{{#if otherSectionsContext}}
Here is some additional context from other parts of their resume:
{{otherSectionsContext}}
{{/if}}

Rewrite the following resume section content based on the user's prompt provided below. Adhere to any instructions within the prompt.

Original Resume Section Content:
{{{resumeSection}}}

User's Prompt for Improvement:
{{{prompt}}}

Respond only with the improved resume section content. Ensure it's well-written and directly addresses the user's prompt.`,
});

// Define the Genkit flow for improving a resume section.
const improveResumeSectionFlow = ai.defineFlow(
  {
    name: 'improveResumeSectionFlow',
    inputSchema: ImproveResumeSectionInputSchema,
    outputSchema: ImproveResumeSectionOutputSchema,
  },
  async input => {
    const {output} = await improveResumeSectionPrompt(input);
    return output!;
  }
);
