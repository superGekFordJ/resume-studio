import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const AutocompleteInputSchema = ai.defineSchema(
  'AutocompleteInputSchema',
  z.object({
    inputText: z
      .string()
      .describe(
        'The user input text for which autocompletion is desired. This is the text BEFORE the cursor.'
      ),
    textAfterCursor: z
      .string()
      .optional()
      .describe('The text AFTER the cursor. Use this to understand the full context.'),
    context: z
      .object({
        currentItemContext: z.string().describe('Context about the current item being edited'),
        otherSectionsContext: z.string().describe('Summary of other resume sections'),
        userJobTitle: z.string().optional().describe("The user's target job title"),
        userJobInfo: z.string().optional().describe("The user's target job info"),
        userBio: z.string().optional().describe("The user's professional bio"),
      })
      .describe('Structured context from SchemaRegistry'),
    // Keep sectionType for backward compatibility
    sectionType: z
      .string()
      .optional()
      .describe('The type of resume section being edited'),
  })
);

export const AutocompleteOutputSchema = ai.defineSchema(
  'AutocompleteOutputSchema',
  z.object({
    completion: z
      .string()
      .describe(
        'The AI-suggested autocompletion text. Should be concise (e.g., a phrase or 1-2 short sentences, or a few key phrases).'
      ),
  })
);

export const BatchImproveSectionInputSchema = ai.defineSchema(
  'BatchImproveSectionInputSchema',
  z.object({
    sectionData: z.record(z.any()).describe('The complete section data with all fields'),
    sectionType: z.string().describe('The type/schema ID of the section being improved'),
    improvementGoals: z
      .array(z.string())
      .describe('List of improvement goals (e.g., "add quantifiable results", "improve clarity")'),
    userJobTitle: z.string().optional().describe("The user's target job title"),
    userJobInfo: z.string().optional().describe("The user's target job info"),
    userBio: z.string().optional().describe("The user's professional bio"),
    otherSectionsContext: z.string().optional().describe('Context from other resume sections'),
    priorityFields: z
      .array(z.string())
      .optional()
      .describe('Fields that should be prioritized for improvement'),
  })
);

export const BatchImproveSectionOutputSchema = ai.defineSchema(
  'BatchImproveSectionOutputSchema',
  z.object({
    improvedSectionData: z.record(z.any()).describe('The improved section data with all fields updated'),
    improvementSummary: z.string().describe('Summary of what improvements were made'),
    fieldChanges: z
      .array(
        z.object({
          fieldId: z.string(),
          originalValue: z.string(),
          improvedValue: z.string(),
          changeReason: z.string(),
        })
      )
      .describe('Detailed list of changes made to each field'),
  })
);

export const ComprehensiveResumeAnalysisInputSchema = ai.defineSchema(
  'ComprehensiveResumeAnalysisInputSchema',
  z.object({
    resumeData: z.record(z.any()).describe('Complete resume data'),
    analysisType: z
      .enum(['ats-optimization', 'content-enhancement', 'structure-improvement', 'industry-alignment'])
      .describe('Type of analysis to perform'),
    targetRole: z.string().optional().describe('Target job role for optimization'),
    industryContext: z.string().optional().describe('Target industry context'),
    experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']).optional().describe('Career level'),
  })
);

export const ComprehensiveResumeAnalysisOutputSchema = ai.defineSchema(
  'ComprehensiveResumeAnalysisOutputSchema',
  z.object({
    overallScore: z.number().min(0).max(100).describe('Overall resume quality score'),
    sectionScores: z.record(z.number()).describe('Individual section scores'),
    priorityImprovements: z
      .array(
        z.object({
          section: z.string(),
          field: z.string().optional(),
          issue: z.string(),
          suggestion: z.string(),
          impact: z.enum(['high', 'medium', 'low']),
          effort: z.enum(['low', 'medium', 'high']),
        })
      )
      .describe('Prioritized list of improvements'),
    atsCompatibility: z
      .object({
        score: z.number().min(0).max(100),
        issues: z.array(z.string()),
        recommendations: z.array(z.string()),
      })
      .describe('ATS compatibility analysis'),
    contentAnalysis: z
      .object({
        strengthsCount: z.number(),
        weaknessesCount: z.number(),
        keywordDensity: z.record(z.number()),
        readabilityScore: z.number(),
      })
      .describe('Content quality analysis'),
    nextSteps: z.array(z.string()).describe('Recommended next steps for improvement'),
  })
);

// Schemas for generateResumeFromContext
export const AIGeneratedExperienceSchema = ai.defineSchema(
  'AIGeneratedExperienceSchema',
  z.object({
    jobTitle: z.string(),
    company: z.string(),
    startDate: z.string().describe("Start date, e.g., 'YYYY-MM' or 'Month YYYY'."),
    endDate: z.string().describe("End date, can be 'Present'."),
    description: z
      .string()
      .describe('A bulleted list of achievements and responsibilities, formatted as a single string with newlines.'),
  })
);

export const AIGeneratedEducationSchema = ai.defineSchema(
  'AIGeneratedEducationSchema',
  z.object({
    degree: z.string(),
    institution: z.string(),
    graduationYear: z.string(),
    details: z.string().optional().describe('Optional details like GPA or honors.'),
  })
);

export const AIGeneratedSkillSchema = ai.defineSchema(
  'AIGeneratedSkillSchema',
  z.object({
    name: z.string(),
    category: z.string().describe("e.g., 'Programming Languages', 'Tools', 'Soft Skills'"),
  })
);

export const AIGeneratedResumeDataSchema = ai.defineSchema(
  'AIGeneratedResumeDataSchema',
  z.object({
    summary: z.string().describe('A 2-4 sentence professional summary tailored to the job description.'),
    experience: z.array(AIGeneratedExperienceSchema).describe('Professional work experience.'),
    education: z.array(AIGeneratedEducationSchema).describe('Educational background.'),
    skills: z.array(AIGeneratedSkillSchema).describe('A list of relevant skills with categories.'),
  })
);

export const GenerateResumeContextInputSchema = ai.defineSchema(
  'GenerateResumeContextInputSchema',
  z.object({
    bio: z.string().describe("The user's professional background and history."),
    jobDescription: z.string().describe('The target job description.'),
  })
);

// Schema for getJobInfoFromImage
export const JobInfoFromImageInputSchema = ai.defineSchema(
  'JobInfoFromImageInputSchema',
  z.object({
    imageBase64: z.string().describe('A Base64 encoded image of a job posting.'),
    contentType: z.string().optional().default('image/png').describe('The MIME type of the image.'),
  })
);

// Schemas for improve-resume-section
export const ImproveResumeSectionInputSchema = ai.defineSchema(
  'ImproveResumeSectionInputSchema',
  z.object({
    resumeSection: z.string().describe('The text content of the resume section to be improved.'),
    prompt: z.string().describe('A prompt providing instructions on how to improve the resume section.'),
    context: z
      .object({
        currentItemContext: z.string().describe('Context about the current item being improved'),
        otherSectionsContext: z.string().describe('Summary of other resume sections'),
        userJobTitle: z.string().optional().describe("The user's target job title"),
        userJobInfo: z.string().optional().describe("The user's target job info"),
        userBio: z.string().optional().describe("The user's professional bio"),
      })
      .describe('Structured context from SchemaRegistry'),
    sectionType: z
      .string()
      .optional()
      .describe('The type of resume section/field being improved'),
  })
);

export const ImproveResumeSectionOutputSchema = ai.defineSchema(
  'ImproveResumeSectionOutputSchema',
  z.object({
    improvedResumeSection: z.string().describe('The AI-rewritten and improved resume section.'),
  })
);
