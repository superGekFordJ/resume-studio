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
  // REMOVE individual optional strings and replace with structured context
  context: z.object({
    currentItemContext: z.string().describe('Context about the current item being improved'),
    otherSectionsContext: z.string().describe('Summary of other resume sections'),
    userJobTitle: z.string().optional().describe("The user's target job title"),
  }).describe('Structured context from SchemaRegistry'),
  // Keep sectionType for backward compatibility
  sectionType: z
    .string()
    .optional()
    .describe('The type of resume section/field being improved'),
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

Context:
{{#if context.userJobTitle}}Target role: {{context.userJobTitle}}{{/if}}
{{#if sectionType}}Section type: {{sectionType}}{{/if}}

Current item being improved:
{{context.currentItemContext}}

Other sections in resume:
{{context.otherSectionsContext}}

Rewrite the following resume section content based on the user's prompt provided below. Adhere to any instructions within the prompt.

Original Resume Section Content:
{{{resumeSection}}}

User's Prompt for Improvement:
{{{prompt}}}

Guidelines for improvement:
- For experience sections: Add quantifiable results, use strong action verbs, highlight impact and achievements
- For skills sections: Organize logically, include relevant technologies, consider current market trends
- For education sections: Include relevant coursework, projects, achievements, and GPA if strong
- For summary sections: Create compelling, concise statements that highlight unique value proposition
- For dynamic sections: Use the field schema hints and improvement suggestions to guide enhancements
- Always maintain professional tone and proper formatting
- Ensure content is ATS-friendly with relevant keywords

Respond only with the improved resume section content. Ensure it's well-written and directly addresses the user's prompt.`,
  config: {
    temperature: 0.3,
    maxOutputTokens: 1000,
    topP: 0.95
  }
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
