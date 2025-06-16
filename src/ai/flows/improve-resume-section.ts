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
import { SchemaRegistry } from '@/lib/schemaRegistry';

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
    .describe('The type of resume section/field being improved (e.g., "experience", "summary", "personalDetailsField", or dynamic schema IDs).'),
  currentItemContext: z
    .string()
    .optional()
    .describe('Brief context of the current item being improved (e.g., "Job: Software Engineer", "Field: Full Name").'),
  otherSectionsContext: z
    .string()
    .optional()
    .describe('A brief summary of other relevant sections in the resume to provide broader context.'),
  // Enhanced context for dynamic sections
  fieldId: z
    .string()
    .optional()
    .describe('The specific field ID being improved in a dynamic section.'),
  currentItemData: z
    .record(z.any())
    .optional()
    .describe('The complete data of the current item being improved.'),
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

// Enhanced context building using SchemaRegistry
function buildEnhancedContext(input: ImproveResumeSectionInput): string {
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
          
          // Add AI improvement prompts if available
          if (fieldSchema.aiHints?.improvementPrompts) {
            contextParts.push(`Improvement suggestions: ${fieldSchema.aiHints.improvementPrompts.join(', ')}`);
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

// Define the prompt for the AI to rewrite the resume section.
const improveResumeSectionPrompt = ai.definePrompt({
  name: 'improveResumeSectionPrompt',
  input: {schema: ImproveResumeSectionInputSchema},
  output: {schema: ImproveResumeSectionOutputSchema},
  prompt: `You are an AI assistant helping a user improve a section of their resume.

{{#if enhancedContext}}
Context:
{{{enhancedContext}}}
{{else}}
{{#if userJobTitle}}Target role: {{userJobTitle}}{{/if}}
{{#if sectionType}}Section type: {{sectionType}}{{/if}}
{{#if currentItemContext}}Current item: {{currentItemContext}}{{/if}}
{{#if otherSectionsContext}}Other sections: {{otherSectionsContext}}{{/if}}
{{/if}}

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
    // Pre-build the enhanced context to avoid Handlebars helper issues
    const enhancedContext = buildEnhancedContext(input);
    
    const enhancedInput = {
      ...input,
      enhancedContext
    };
    
    const {output} = await improveResumeSectionPrompt(enhancedInput);
    return output!;
  }
);
