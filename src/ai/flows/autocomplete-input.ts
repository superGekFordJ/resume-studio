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
  // REMOVE individual optional strings and replace with structured context
  context: z.object({
    currentItemContext: z.string().describe('Context about the current item being edited'),
    otherSectionsContext: z.string().describe('Summary of other resume sections'),
    userJobTitle: z.string().optional().describe("The user's target job title"),
  }).describe('Structured context from SchemaRegistry'),
  // Keep sectionType for backward compatibility
  sectionType: z
    .string()
    .optional()
    .describe('The type of resume section being edited'),
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

Context:
{{#if context.userJobTitle}}Target role: {{context.userJobTitle}}{{/if}}
{{#if sectionType}}Section type: {{sectionType}}{{/if}}

Current item being edited:
{{context.currentItemContext}}

Other sections in resume:
{{context.otherSectionsContext}}

Based on all this information, provide a concise completion for the following input text:
"{{{inputText}}}"

The completion should naturally follow the input text. Keep the suggestion brief, impactful, and limited to a few words or one to two short sentences at most.

Guidelines by section type:
- For 'experience' or job-related fields: Focus on quantifiable achievements, responsibilities, or impact
- For 'summary': Focus on an impactful statement that summarizes their profile or objectives
- For 'skills': Suggest a relevant skill or a short phrase elaborating on a skill
- For 'education': Suggest a relevant detail like a specific project, coursework, or academic achievement
- For 'customText': Provide a well-phrased continuation of their custom text
- For 'personalDetailsField': Provide a suitable completion for that personal detail field
- For dynamic sections: Use the field type and schema hints to provide contextually appropriate suggestions

Respond only with the suggested additional text to complete the input. Make it short and to the point.`,
  model: 'googleai/gemini-2.5-flash-lite-preview-06-17', // Explicitly using the lighter model for faster completions
  config: {
    temperature: 0.3,
    maxOutputTokens: 6000,
    topP: 0.95,
  }
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
