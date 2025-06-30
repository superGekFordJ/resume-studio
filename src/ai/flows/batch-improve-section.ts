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
  BatchImproveSectionInputSchema,
  BatchImproveSectionOutputSchema,
  ComprehensiveResumeAnalysisInputSchema,
  ComprehensiveResumeAnalysisOutputSchema,
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
    const prompt = ai.prompt<
      typeof BatchImproveSectionInputSchema,
      typeof BatchImproveSectionOutputSchema
    >('batchImproveSection');
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Batch Improve Section failed to produce an output.');
    }
    return output;
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