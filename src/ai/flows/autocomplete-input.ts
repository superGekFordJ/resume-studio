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
import { SchemaRegistry } from '@/lib/schemaRegistry';

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
    .describe('The type of resume section being edited (e.g., "experience", "summary", "skills", "education", "customText", "personalDetailsField", or dynamic schema IDs).'),
  currentItemContext: z
    .string()
    .optional()
    .describe('Brief context of the current item being edited (e.g., "Job: Software Engineer at Tech Co", "Degree: BSc Computer Science", "Field: Full Name").'),
  otherSectionsContext: z
    .string()
    .optional()
    .describe('A brief summary of other relevant sections in the resume to provide broader context.'),
  // Enhanced context for dynamic sections
  fieldId: z
    .string()
    .optional()
    .describe('The specific field ID being edited in a dynamic section.'),
  currentItemData: z
    .record(z.any())
    .optional()
    .describe('The complete data of the current item being edited.'),
  allResumeData: z
    .record(z.any())
    .optional()
    .describe('The complete resume data for comprehensive context building.'),
  // Pre-built enhanced context to avoid Handlebars helper issues
  enhancedContext: z
    .string()
    .optional()
    .describe('Pre-built enhanced context string using SchemaRegistry.'),
});
export type AutocompleteInputInput = z.infer<typeof AutocompleteInputInputSchema>;

const AutocompleteInputOutputSchema = z.object({
  completion: z.string().describe('The AI-suggested autocompletion text. Should be concise (e.g., a phrase or 1-2 short sentences, or a few key phrases).'),
});
export type AutocompleteInputOutput = z.infer<typeof AutocompleteInputOutputSchema>;

export async function autocompleteInput(input: AutocompleteInputInput): Promise<AutocompleteInputOutput> {
  return autocompleteInputFlow(input);
}

// Enhanced context building using SchemaRegistry
function buildEnhancedContext(input: AutocompleteInputInput): string {
  const schemaRegistry = SchemaRegistry.getInstance();
  let contextParts: string[] = [];

  // Add user job title context
  if (input.userJobTitle) {
    contextParts.push(`Target role: ${input.userJobTitle}`);
  }

  // Build section-specific context using SchemaRegistry
  if (input.sectionType) {
    const sectionSchema = schemaRegistry.getSectionSchema(input.sectionType);
    if (sectionSchema) {
      contextParts.push(`Section: ${sectionSchema.name} (${sectionSchema.type})`);
      
      // Add field-specific context for dynamic sections
      if (input.fieldId) {
        const fieldSchema = schemaRegistry.getFieldSchema(input.sectionType, input.fieldId);
        if (fieldSchema) {
          contextParts.push(`Field: ${fieldSchema.label} (${fieldSchema.type})`);
          
          // Add AI hints if available
          if (fieldSchema.aiHints?.improvementPrompts) {
            contextParts.push(`Suggestions: ${fieldSchema.aiHints.improvementPrompts.join(', ')}`);
          }
        }
      }

      // Build context using schema registry context builders
      if (input.currentItemData && input.allResumeData) {
        try {
          if (sectionSchema.aiContext?.itemContextBuilder) {
            const builtContext = schemaRegistry.buildContext(
              sectionSchema.aiContext.itemContextBuilder,
              input.currentItemData,
              input.allResumeData
            );
            if (builtContext) {
              contextParts.push(`Item context: ${builtContext}`);
            }
          }
        } catch (error) {
          console.warn('Failed to build context using schema registry:', error);
        }
      }
    } else {
      // Fallback for legacy section types
      contextParts.push(`Section type: ${input.sectionType}`);
    }
  }

  // Add current item context (legacy support)
  if (input.currentItemContext) {
    contextParts.push(`Current item: ${input.currentItemContext}`);
  }

  // Add other sections context
  if (input.otherSectionsContext) {
    contextParts.push(`Other sections: ${input.otherSectionsContext}`);
  }

  return contextParts.join('\n');
}

const prompt = ai.definePrompt({
  name: 'autocompleteInputPrompt',
  input: {schema: AutocompleteInputInputSchema},
  output: {schema: AutocompleteInputOutputSchema},
  prompt: `You are an AI assistant helping a user write their resume. Your goal is to provide a concise and relevant completion (a phrase, 1-2 short sentences, or a few key phrases) for the text they've started writing.

{{#if enhancedContext}}
Context:
{{{enhancedContext}}}
{{else}}
{{#if userJobTitle}}Target role: {{userJobTitle}}{{/if}}
{{#if sectionType}}Section type: {{sectionType}}{{/if}}
{{#if currentItemContext}}Current item: {{currentItemContext}}{{/if}}
{{#if otherSectionsContext}}Other sections: {{otherSectionsContext}}{{/if}}
{{/if}}

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
  model: 'googleai/gemini-2.0-flash-lite', // Explicitly using the lighter model for faster completions
  config: {
    temperature: 0.3,
    maxOutputTokens: 50,
    topP: 0.95
  }
});

const autocompleteInputFlow = ai.defineFlow(
  {
    name: 'autocompleteInputFlow',
    inputSchema: AutocompleteInputInputSchema,
    outputSchema: AutocompleteInputOutputSchema,
  },
  async input => {
    // Pre-build the enhanced context to avoid Handlebars helper issues
    const enhancedContext = buildEnhancedContext(input);
    
    const enhancedInput = {
      ...input,
      enhancedContext
    };
    
    const {output} = await prompt(enhancedInput);
    return output!;
  }
);
