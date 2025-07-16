// src/ai/flows/autocomplete-input.ts
'use server';
/**
 * @fileOverview Provides AI-powered autocompletion suggestions for skills and experience descriptions.
 *
 * - autocompleteInput - A function that suggests completions for user input.
 * - AutocompleteInput - The input type for the autocompleteInput function.
 * - AutocompleteInputOutput - The return type for the autocompleteInput function.
 */

import { aiManager } from '@/ai/AIManager';
import { z } from 'genkit';
import {
  AutocompleteInputSchema,
  AutocompleteOutputSchema,
} from '../prompts/schemas';
import _ from 'lodash';

export type AutocompleteInput = z.infer<typeof AutocompleteInputSchema>;
export type AutocompleteOutput = z.infer<typeof AutocompleteOutputSchema>;

const flowCache = new Map<string, any>();

export async function autocompleteInput(
  input: AutocompleteInput
): Promise<AutocompleteOutput> {
  const cacheKey = JSON.stringify(_.pick(input.aiConfig, ['provider', 'apiKey']));

  let autocompleteInputFlow = flowCache.get(cacheKey);

  if (!autocompleteInputFlow) {
    const ai = aiManager.getGenkit(input.aiConfig);

    autocompleteInputFlow = ai.defineFlow(
      {
        name: `autocompleteInputFlow_${flowCache.size}`, // Unique name for each flow instance
        inputSchema: AutocompleteInputSchema,
        outputSchema: AutocompleteOutputSchema,
      },
      async (flowInput) => {       
        const autocompletePrompt = ai.prompt<
          typeof AutocompleteInputSchema,
          typeof AutocompleteOutputSchema
        >('autocompleteInput');
        const { output } = await autocompletePrompt(flowInput);

        if (!output) {
          throw new Error('AI failed to provide an autocompletion response.');
        }

        return output;
      }
    );
    flowCache.set(cacheKey, autocompleteInputFlow);
  }

  return autocompleteInputFlow(input);
}
