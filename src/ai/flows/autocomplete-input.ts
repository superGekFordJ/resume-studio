// src/ai/flows/autocomplete-input.ts
'use server';
/**
 * @fileOverview Provides AI-powered autocompletion suggestions for skills and experience descriptions.
 *
 * - autocompleteInput - A function that suggests completions for user input.
 * - AutocompleteInput - The input type for the autocompleteInput function.
 * - AutocompleteInputOutput - The return type for the autocompleteInput function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  AutocompleteInputSchema,
  AutocompleteOutputSchema,
} from '../prompts/schemas';

export type AutocompleteInput = z.infer<typeof AutocompleteInputSchema>;
export type AutocompleteOutput = z.infer<typeof AutocompleteOutputSchema>;

export async function autocompleteInput(
  input: AutocompleteInput
): Promise<AutocompleteOutput> {
  return autocompleteInputFlow(input);
}

const autocompleteInputFlow = ai.defineFlow(
  {
    name: 'autocompleteInputFlow',
    inputSchema: AutocompleteInputSchema,
    outputSchema: AutocompleteOutputSchema,
  },
  async (input: AutocompleteInput) => {
    const autocompletePrompt = ai.prompt<
      typeof AutocompleteInputSchema,
      typeof AutocompleteOutputSchema
    >('autocompleteInput');
    const { output } = await autocompletePrompt(input);

    if (!output) {
      throw new Error('AI failed to provide an autocompletion response.');
    }

    return output;
  }
);
