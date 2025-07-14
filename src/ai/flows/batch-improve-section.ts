'use server';

/**
 * @fileOverview AI-powered batch improvement for entire resume sections.
 * 
 * This flow can improve multiple fields within a section simultaneously,
 * providing more comprehensive and contextually aware improvements.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  AIBridgedSectionSchema,
  ComprehensiveResumeAnalysisInputSchema,
  ComprehensiveResumeAnalysisOutputSchema,
  BatchImproveSectionOutputWrapperSchema,
  BatchImproveSectionInputSchema,
  BatchImproveSectionOutputSchema,
} from '../prompts/schemas';


export type BatchImproveSectionInput = z.infer<
  typeof BatchImproveSectionInputSchema
>;
export type BatchImproveSectionOutput = z.infer<
  typeof BatchImproveSectionOutputSchema
>;

export async function batchImproveSection(
  input: BatchImproveSectionInput
): Promise<BatchImproveSectionOutput> {
  return batchImproveSectionFlow(input);
}

const batchImproveSectionFlow = ai.defineFlow(
  {
    name: 'batchImproveSectionFlow',
    inputSchema: BatchImproveSectionInputSchema,
    outputSchema: BatchImproveSectionOutputSchema,
  },
  async input => {
    const { SchemaRegistry } = await import('@/lib/schemaRegistry');
    const { AIDataBridge } = await import('@/lib/aiDataBridge');
    
    const schemaRegistry = SchemaRegistry.getInstance();
    const schemaInstructions = AIDataBridge.buildSchemaInstruction(schemaRegistry, input.section.schemaId);
    
    // Call the prompt expecting the wrapper schema
    const prompt = ai.prompt<
      typeof BatchImproveSectionInputSchema,
      typeof BatchImproveSectionOutputWrapperSchema
    >('batchImproveSection');
    
    const { output: wrappedOutput } = await prompt({
      ...input,
      schemaInstructions,
    });
    
    if (!wrappedOutput?.improvedSectionJson) {
      throw new Error('Batch Improve Section failed to produce an output.');
    }
    
    try {
      // Parse the JSON string from the wrapper
      const parsedSection = JSON.parse(wrappedOutput.improvedSectionJson);
      
      // Validate the parsed object against our internal schema
      const validatedSection = AIBridgedSectionSchema.parse(parsedSection);
      
      // Return the final output matching the flow's expected schema
      return {
        improvedSection: validatedSection,
        improvementSummary: wrappedOutput.improvementSummary,
      };
    } catch (error) {
      console.error('Failed to parse or validate improved section:', error);
      throw new Error('Failed to parse AI-generated improvements. Please try again.');
    }
  }
);

// Enhanced AI Flow for comprehensive resume analysis and improvement
export type ComprehensiveResumeAnalysisInput = z.infer<
  typeof ComprehensiveResumeAnalysisInputSchema
>;
export type ComprehensiveResumeAnalysisOutput = z.infer<
  typeof ComprehensiveResumeAnalysisOutputSchema
>;

export async function comprehensiveResumeAnalysis(
  input: ComprehensiveResumeAnalysisInput
): Promise<ComprehensiveResumeAnalysisOutput> {
  return comprehensiveResumeAnalysisFlow(input);
}

const comprehensiveResumeAnalysisFlow = ai.defineFlow(
  {
    name: 'comprehensiveResumeAnalysisFlow',
    inputSchema: ComprehensiveResumeAnalysisInputSchema,
    outputSchema: ComprehensiveResumeAnalysisOutputSchema,
  },
  async input => {
    const prompt = ai.prompt<
      typeof ComprehensiveResumeAnalysisInputSchema,
      typeof ComprehensiveResumeAnalysisOutputSchema
    >('comprehensiveResumeAnalysis');
    const { output } = await prompt(input);
    if (!output) {
      throw new Error(
        'Comprehensive Resume Analysis failed to produce an output.'
      );
    }
    return output;
  }
); 