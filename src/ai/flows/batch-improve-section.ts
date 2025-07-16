'use server';

/**
 * @fileOverview AI-powered batch improvement for entire resume sections.
 * 
 * This flow can improve multiple fields within a section simultaneously,
 * providing more comprehensive and contextually aware improvements.
 */

import { aiManager } from '@/ai/AIManager';
import { z } from 'genkit';
import {
  AIBridgedSectionSchema,
  BatchImproveSectionOutputWrapperSchema,
  ComprehensiveResumeAnalysisInputSchema,
  ComprehensiveResumeAnalysisOutputSchema,
  BatchImproveSectionInputSchema,
  BatchImproveSectionOutputSchema,
} from '../prompts/schemas';
import _ from 'lodash';

export type BatchImproveSectionInput = z.infer<
  typeof BatchImproveSectionInputSchema
>;
export type BatchImproveSectionOutput = z.infer<
  typeof BatchImproveSectionOutputSchema
>;

const batchImproveFlowCache = new Map<string, any>();

export async function batchImproveSection(
  input: BatchImproveSectionInput
): Promise<BatchImproveSectionOutput> {
  const cacheKey = JSON.stringify(_.pick(input.aiConfig, ['provider', 'apiKey']));

  let batchImproveSectionFlow = batchImproveFlowCache.get(cacheKey);

  if (!batchImproveSectionFlow) {
    const ai = aiManager.getGenkit(input.aiConfig);
    batchImproveSectionFlow = ai.defineFlow(
      {
        name: `batchImproveSectionFlow_${batchImproveFlowCache.size}`,
        inputSchema: BatchImproveSectionInputSchema,
        outputSchema: BatchImproveSectionOutputSchema,
      },
      async (flowInput) => {
        // Call the prompt expecting the wrapper schema
        const prompt = ai.prompt<
          typeof BatchImproveSectionInputSchema,
          typeof BatchImproveSectionOutputWrapperSchema
        >('batchImproveSection');
        
        const { output: wrappedOutput } = await prompt(flowInput);
        
        if (!wrappedOutput?.improvedSectionJson) {
          throw new Error('Batch Improve Section failed to produce an output.');
        }
        
        try {
          // Parse the JSON string from the wrapper
          const parsedSection = JSON.parse(wrappedOutput.improvedSectionJson);
          
          const validatedSection = AIBridgedSectionSchema.parse(parsedSection);
          
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
    batchImproveFlowCache.set(cacheKey, batchImproveSectionFlow);
  }

  return batchImproveSectionFlow(input);
}

// Enhanced AI Flow for comprehensive resume analysis and improvement
export type ComprehensiveResumeAnalysisInput = z.infer<
  typeof ComprehensiveResumeAnalysisInputSchema
>;
export type ComprehensiveResumeAnalysisOutput = z.infer<
  typeof ComprehensiveResumeAnalysisOutputSchema
>;

const comprehensiveAnalysisFlowCache = new Map<string, any>();

export async function comprehensiveResumeAnalysis(
  input: ComprehensiveResumeAnalysisInput
): Promise<ComprehensiveResumeAnalysisOutput> {
  const cacheKey = JSON.stringify(_.pick(input.aiConfig, ['provider', 'apiKey']));
  let comprehensiveResumeAnalysisFlow = comprehensiveAnalysisFlowCache.get(cacheKey);

  if (!comprehensiveResumeAnalysisFlow) {
    const ai = aiManager.getGenkit(input.aiConfig);
    comprehensiveResumeAnalysisFlow = ai.defineFlow(
      {
        name: `comprehensiveResumeAnalysisFlow_${comprehensiveAnalysisFlowCache.size}`,
        inputSchema: ComprehensiveResumeAnalysisInputSchema,
        outputSchema: ComprehensiveResumeAnalysisOutputSchema,
      },
      async (flowInput) => {
        const prompt = ai.prompt<
          typeof ComprehensiveResumeAnalysisInputSchema,
          typeof ComprehensiveResumeAnalysisOutputSchema
        >('comprehensiveResumeAnalysis');
        const { output } = await prompt(flowInput);
        if (!output) {
          throw new Error(
            'Comprehensive Resume Analysis failed to produce an output.'
          );
        }
        return output;
      }
    );
    comprehensiveAnalysisFlowCache.set(cacheKey, comprehensiveResumeAnalysisFlow);
  }
  
  return comprehensiveResumeAnalysisFlow(input);
}
