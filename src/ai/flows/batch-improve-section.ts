'use server';

/**
 * @fileOverview AI-powered batch improvement for entire resume sections.
 * 
 * This flow can improve multiple fields within a section simultaneously,
 * providing more comprehensive and contextually aware improvements.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BatchImproveSectionInputSchema = z.object({
  sectionData: z.record(z.any()).describe('The complete section data with all fields'),
  sectionType: z.string().describe('The type/schema ID of the section being improved'),
  improvementGoals: z.array(z.string()).describe('List of improvement goals (e.g., "add quantifiable results", "improve clarity")'),
  userJobTitle: z.string().optional().describe("The user's target job title"),
  otherSectionsContext: z.string().optional().describe('Context from other resume sections'),
  priorityFields: z.array(z.string()).optional().describe('Fields that should be prioritized for improvement'),
});

export type BatchImproveSectionInput = z.infer<typeof BatchImproveSectionInputSchema>;

const BatchImproveSectionOutputSchema = z.object({
  improvedSectionData: z.record(z.any()).describe('The improved section data with all fields updated'),
  improvementSummary: z.string().describe('Summary of what improvements were made'),
  fieldChanges: z.array(z.object({
    fieldId: z.string(),
    originalValue: z.string(),
    improvedValue: z.string(),
    changeReason: z.string()
  })).describe('Detailed list of changes made to each field')
});

export type BatchImproveSectionOutput = z.infer<typeof BatchImproveSectionOutputSchema>;

export async function batchImproveSection(input: BatchImproveSectionInput): Promise<BatchImproveSectionOutput> {
  return batchImproveSectionFlow(input);
}

const batchImproveSectionPrompt = ai.definePrompt({
  name: 'batchImproveSectionPrompt',
  input: { schema: BatchImproveSectionInputSchema },
  output: { schema: BatchImproveSectionOutputSchema },
  prompt: `You are an expert resume writer helping to improve an entire resume section comprehensively.

**Section Type:** {{sectionType}}
{{#if userJobTitle}}**Target Role:** {{userJobTitle}}{{/if}}

**Current Section Data:**
{{#each sectionData}}
- {{@key}}: {{{this}}}
{{/each}}

**Improvement Goals:**
{{#each improvementGoals}}
- {{this}}
{{/each}}

{{#if priorityFields}}
**Priority Fields to Focus On:**
{{#each priorityFields}}
- {{this}}
{{/each}}
{{/if}}

{{#if otherSectionsContext}}
**Context from Other Resume Sections:**
{{otherSectionsContext}}
{{/if}}

**Instructions:**
1. Improve the section data comprehensively, considering all fields together for consistency
2. Ensure improvements align with the specified goals
3. Maintain professional tone and formatting
4. For experience/project sections: Add quantifiable results, use action verbs, highlight impact
5. For skills sections: Organize logically, add relevant technologies, consider market trends
6. For education sections: Include relevant details, coursework, achievements
7. Keep the same field structure but improve the content quality
8. Ensure all improvements work together cohesively

Return the improved section data maintaining the exact same field structure, plus a summary of improvements made.`,
});

const batchImproveSectionFlow = ai.defineFlow(
  {
    name: 'batchImproveSectionFlow',
    inputSchema: BatchImproveSectionInputSchema,
    outputSchema: BatchImproveSectionOutputSchema,
  },
  async (input) => {
    const { output } = await batchImproveSectionPrompt(input);
    return output!;
  }
);

// Enhanced AI Flow for comprehensive resume analysis and improvement
const ComprehensiveResumeAnalysisInputSchema = z.object({
  resumeData: z.record(z.any()).describe('Complete resume data'),
  analysisType: z.enum(['ats-optimization', 'content-enhancement', 'structure-improvement', 'industry-alignment']).describe('Type of analysis to perform'),
  targetRole: z.string().optional().describe('Target job role for optimization'),
  industryContext: z.string().optional().describe('Target industry context'),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']).optional().describe('Career level'),
});

export type ComprehensiveResumeAnalysisInput = z.infer<typeof ComprehensiveResumeAnalysisInputSchema>;

const ComprehensiveResumeAnalysisOutputSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('Overall resume quality score'),
  sectionScores: z.record(z.number()).describe('Individual section scores'),
  priorityImprovements: z.array(z.object({
    section: z.string(),
    field: z.string().optional(),
    issue: z.string(),
    suggestion: z.string(),
    impact: z.enum(['high', 'medium', 'low']),
    effort: z.enum(['low', 'medium', 'high'])
  })).describe('Prioritized list of improvements'),
  atsCompatibility: z.object({
    score: z.number().min(0).max(100),
    issues: z.array(z.string()),
    recommendations: z.array(z.string())
  }).describe('ATS compatibility analysis'),
  contentAnalysis: z.object({
    strengthsCount: z.number(),
    weaknessesCount: z.number(),
    keywordDensity: z.record(z.number()),
    readabilityScore: z.number()
  }).describe('Content quality analysis'),
  nextSteps: z.array(z.string()).describe('Recommended next steps for improvement')
});

export type ComprehensiveResumeAnalysisOutput = z.infer<typeof ComprehensiveResumeAnalysisOutputSchema>;

export async function comprehensiveResumeAnalysis(input: ComprehensiveResumeAnalysisInput): Promise<ComprehensiveResumeAnalysisOutput> {
  return comprehensiveResumeAnalysisFlow(input);
}

const comprehensiveResumeAnalysisPrompt = ai.definePrompt({
  name: 'comprehensiveResumeAnalysisPrompt',
  input: { schema: ComprehensiveResumeAnalysisInputSchema },
  output: { schema: ComprehensiveResumeAnalysisOutputSchema },
  prompt: `You are a senior resume consultant performing a comprehensive analysis of a resume.

**Analysis Type:** {{analysisType}}
{{#if targetRole}}**Target Role:** {{targetRole}}{{/if}}
{{#if industryContext}}**Industry:** {{industryContext}}{{/if}}
{{#if experienceLevel}}**Experience Level:** {{experienceLevel}}{{/if}}

**Resume Data:**
{{{resumeData}}}

**Analysis Framework:**

1. **Overall Quality Assessment (0-100):**
   - Content relevance and impact
   - Professional presentation
   - Completeness and structure
   - Industry alignment

2. **Section-by-Section Scoring:**
   - Evaluate each section individually
   - Consider content quality, relevance, and presentation

3. **Priority Improvements:**
   - Identify high-impact, actionable improvements
   - Rank by impact vs effort required
   - Focus on {{analysisType}} specifically

4. **ATS Compatibility:**
   - Keyword optimization
   - Format compatibility
   - Section organization
   - Parsing friendliness

5. **Content Analysis:**
   - Count quantifiable achievements
   - Identify missing elements
   - Analyze keyword density for target role
   - Assess readability and flow

**Provide specific, actionable recommendations with clear priorities and expected impact.**`,
  model: 'googleai/gemini-2.5-flash-preview-05-20', // Use more powerful model for complex analysis
});

const comprehensiveResumeAnalysisFlow = ai.defineFlow(
  {
    name: 'comprehensiveResumeAnalysisFlow',
    inputSchema: ComprehensiveResumeAnalysisInputSchema,
    outputSchema: ComprehensiveResumeAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await comprehensiveResumeAnalysisPrompt(input);
    return output!;
  }
); 