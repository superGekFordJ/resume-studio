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

const AutocompleteInputSchema = z.object({
  inputText: z
    .string()
    .describe('The user input text for which autocompletion is desired. This is the text BEFORE the cursor.'),
  textAfterCursor: z
    .string()
    .optional()
    .describe('The text AFTER the cursor. Use this to understand the full context.'),
  context: z.object({
    currentItemContext: z.string().describe('Context about the current item being edited'),
    otherSectionsContext: z.string().describe('Summary of other resume sections'),
    userJobTitle: z.string().optional().describe("The user's target job title"),
    userJobInfo: z.string().optional().describe("The user's target job info"),
    userBio: z.string().optional().describe("The user's professional bio"),
  }).describe('Structured context from SchemaRegistry'),
  // Keep sectionType for backward compatibility
  sectionType: z
    .string()
    .optional()
    .describe('The type of resume section being edited'),
});
export type AutocompleteInput = z.infer<typeof AutocompleteInputSchema>;

const AutocompleteOutputSchema = z.object({
  completion: z.string().describe('The AI-suggested autocompletion text. Should be concise (e.g., a phrase or 1-2 short sentences, or a few key phrases).'),
});
export type AutocompleteOutput = z.infer<typeof AutocompleteOutputSchema>;

export async function autocompleteInput(input: AutocompleteInput): Promise<AutocompleteOutput> {
  return autocompleteInputFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autocompleteInputPrompt',
  input: {schema: AutocompleteInputSchema},
  output: {schema: AutocompleteOutputSchema},
  prompt: `You are an AI assistant helping a user write their resume. Your goal is to provide a concise and relevant completion (a phrase, 1-2 short sentences, or a few key phrases) for the text they've started writing.

Context:
{{#if context.userJobTitle}}Target role: {{context.userJobTitle}}{{/if}}
{{#if context.userJobInfo}}Target job info: {{context.userJobInfo}}{{/if}}
{{#if context.userBio}}User Bio: {{context.userBio}}{{/if}}
{{#if sectionType}}Section type: {{sectionType}}{{/if}}

Current item being edited:
{{context.currentItemContext}}

Other sections in resume:
{{context.otherSectionsContext}}

User's current text (with cursor position marked by <CURSOR>):
{{{inputText}}}<CURSOR（The user is typing, stop the cursor here. Adjust yourself to the user's style and implied intent.）>{{{textAfterCursor}}}

Instructions:
1. Read the text before and after <CURSOR> together with the provided context.
2. Predict the most natural, impactful text to insert at <CURSOR> so the sentence flows well.
3. Return ONLY the insertion text—no quotes, markdown, or additional characters.
4. If the insertion should start with a space, include that leading space.

Guidelines by section type:
- For 'experience' or job-related fields: Focus on quantifiable achievements, responsibilities, or impact
- For 'summary': Focus on an impactful statement that summarizes their profile or objectives
- For 'skills': Suggest a relevant skill or a short phrase elaborating on a skill
- For 'education': Suggest a relevant detail like a specific project, coursework, or academic achievement
- For 'customText': Provide a well-phrased continuation of their custom text
- For 'personalDetailsField': Provide a suitable completion for that personal detail field
- For dynamic sections: Use the field type and schema hints to provide contextually appropriate suggestions

Respond with the insertion text only.`,
  model: 'googleai/gemini-2.5-flash-lite-preview-06-17', // Explicitly using the lighter model for faster completions
  config: {
    temperature: 0.3,
    maxOutputTokens: 10000, //allow more tokens for thought budget
    topP: 0.95,
  }
});

const autocompleteInputFlow = ai.defineFlow(
  {
    name: 'autocompleteInputFlow',
    inputSchema: AutocompleteInputSchema,
    outputSchema: AutocompleteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
