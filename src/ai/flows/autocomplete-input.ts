
// src/ai/flows/autocomplete-input.ts
'use server';
/**
 * @fileOverview Provides AI-powered autocompletion suggestions for skills and experience descriptions.
 *
 * - autocompleteInput - A function that suggests completions for user input.
 * - AutocompleteInputInput - The input type for the autocompleteInput function.
 * - AutocompleteInputOutput - The return type for the autocompleteInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutocompleteInputInputSchema = z.object({
  inputText: z
    .string()
    .describe('The user input text for which autocompletion is desired.'),
  userJobTitle: z
    .string()
    .optional()
    .describe("The user's overall job title or target role from their personal details."),
  sectionType: z
    .string()
    .optional()
    .describe('The type of resume section being edited (e.g., "experience", "summary", "skills", "education", "customText", "personalDetailsField").'),
  currentItemContext: z
    .string()
    .optional()
    .describe('Brief context of the current item being edited (e.g., "Job: Software Engineer at Tech Co", "Degree: BSc Computer Science", "Field: Full Name").'),
  otherSectionsContext: z
    .string()
    .optional()
    .describe('A brief summary of other relevant sections in the resume to provide broader context.'),
});
export type AutocompleteInputInput = z.infer<typeof AutocompleteInputInputSchema>;

const AutocompleteInputOutputSchema = z.object({
  completion: z.string().describe('The AI-suggested autocompletion text. Should be concise (e.g., a phrase or 1-2 short sentences, or a few key phrases).'),
});
export type AutocompleteInputOutput = z.infer<typeof AutocompleteInputOutputSchema>;

export async function autocompleteInput(input: AutocompleteInputInput): Promise<AutocompleteInputOutput> {
  return autocompleteInputFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autocompleteInputPrompt',
  input: {schema: AutocompleteInputInputSchema},
  output: {schema: AutocompleteInputOutputSchema},
  prompt: `You are an AI assistant helping a user write their resume. Your goal is to provide a concise and relevant completion (a phrase, 1-2 short sentences, or a few key phrases) for the text they've started writing.

User's target role: {{#if userJobTitle}}'{{userJobTitle}}'{{else}}Not specified{{/if}}.
Currently editing: {{#if sectionType}}The '{{sectionType}}' section/field.{{else}}An unspecified part of the resume.{{/if}}
{{#if currentItemContext}}Specific item context: {{currentItemContext}}.{{/if}}

{{#if otherSectionsContext}}
Additional context from other parts of their resume:
{{otherSectionsContext}}
{{/if}}

Based on all this information, provide a concise completion for the following input text:
"{{{inputText}}}"

The completion should naturally follow the input text. Keep the suggestion brief, impactful, and limited to a few words or one to two short sentences at most.

If the sectionType is 'experience', focus on quantifiable achievements, responsibilities, or impact.
If the sectionType is 'summary', focus on an impactful statement that summarizes their profile or objectives.
If the sectionType is 'skills', suggest a relevant skill or a short phrase elaborating on a skill.
If the sectionType is 'education', suggest a relevant detail like a specific project, coursework, or academic achievement.
If the sectionType is 'customText', provide a well-phrased continuation of their custom text.
If the sectionType is 'personalDetailsField', provide a suitable completion for that personal detail field (e.g., for 'jobTitle', a relevant job title; for 'address', a common address phrase).

Respond only with the suggested additional text to complete the input. Make it short and to the point.`,
  model: 'googleai/gemini-2.0-flash-lite', // Explicitly using the lighter model for faster completions
});

const autocompleteInputFlow = ai.defineFlow(
  {
    name: 'autocompleteInputFlow',
    inputSchema: AutocompleteInputInputSchema,
    outputSchema: AutocompleteInputOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
