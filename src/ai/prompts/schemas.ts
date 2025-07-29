import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// NEW: Schemas for AIDataBridge
export const AIBridgedSectionSchema = ai.defineSchema(
  'AIBridgedSectionSchema',
  z.object({
    schemaId: z
      .string()
      .describe('The schema ID of the section (e.g., experience, education)'),
    // Define items as an array of records (string keys, any values) which is a standard for dynamic objects.
    items: z
      .array(z.record(z.string(), z.any()))
      .describe('Array of items with dynamic fields based on the schema'),
  })
);

export const AIBridgedResumeSchema = ai.defineSchema(
  'AIBridgedResumeSchema',
  z.object({
    sections: z
      .array(AIBridgedSectionSchema)
      .describe('Array of sections in the resume'),
  })
);

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
      .describe(
        'The text AFTER the cursor. Use this to understand the full context.'
      ),
    context: z
      .object({
        currentItemContext: z
          .string()
          .describe('Context about the current item being edited'),
        otherSectionsContext: z
          .string()
          .describe('Summary of other resume sections'),
        userJobTitle: z
          .string()
          .optional()
          .describe("The user's target job title"),
        userJobInfo: z
          .string()
          .optional()
          .describe("The user's target job info"),
        userBio: z.string().optional().describe("The user's professional bio"),
      })
      .describe('Structured context from SchemaRegistry'),
    // Keep sectionType for backward compatibility
    sectionType: z
      .string()
      .optional()
      .describe('The type of resume section being edited'),
    autocompleteModel: z
      .enum(['lite', 'smart', 'slow'])
      .optional()
      .describe(
        'The desired model variant for autocompletion. "smart" for high-quality, "slow" for more detailed, "lite" for standard.'
      ),
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
    section: AIBridgedSectionSchema,
    improvementGoals: z.array(z.string()).describe('List of improvement goals'),
    userJobTitle: z.string().optional(),
    userJobInfo: z.string().optional(),
    userBio: z.string().optional(),
    otherSectionsContext: z.string().optional(),
    schemaInstructions: z
      .string()
      .optional()
      .describe('Dynamic schema instructions built from SchemaRegistry'),
  })
);

export const BatchImproveSectionOutputSchema = ai.defineSchema(
  'BatchImproveSectionOutputSchema',
  z.object({
    improvedSection: AIBridgedSectionSchema,
    improvementSummary: z.string(),
  })
);

// NEW: Wrapper schema for batch improvement to avoid 400 errors with dynamic JSON
export const BatchImproveSectionOutputWrapperSchema = ai.defineSchema(
  'BatchImproveSectionOutputWrapperSchema',
  z.object({
    improvedSectionJson: z
      .string()
      .describe(
        'The improved section data as a single, JSON-escaped string containing the AIBridgedSection structure.'
      ),
    improvementSummary: z.string().describe('A summary of the changes made.'),
  })
);

export const ComprehensiveResumeAnalysisInputSchema = ai.defineSchema(
  'ComprehensiveResumeAnalysisInputSchema',
  z.object({
    resumeData: z.record(z.any()).describe('Complete resume data'),
    analysisType: z
      .enum([
        'ats-optimization',
        'content-enhancement',
        'structure-improvement',
        'industry-alignment',
      ])
      .describe('Type of analysis to perform'),
    targetRole: z
      .string()
      .optional()
      .describe('Target job role for optimization'),
    industryContext: z.string().optional().describe('Target industry context'),
    experienceLevel: z
      .enum(['entry', 'mid', 'senior', 'executive'])
      .optional()
      .describe('Career level'),
  })
);

export const ComprehensiveResumeAnalysisOutputSchema = ai.defineSchema(
  'ComprehensiveResumeAnalysisOutputSchema',
  z.object({
    overallScore: z
      .number()
      .min(0)
      .max(100)
      .describe('Overall resume quality score'),
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
    nextSteps: z
      .array(z.string())
      .describe('Recommended next steps for improvement'),
  })
);

export const GenerateResumeContextInputSchema = ai.defineSchema(
  'GenerateResumeContextInputSchema',
  z.object({
    bio: z.string().describe("The user's professional background and history."),
    jobDescription: z.string().describe('The target job description.'),
    schemaInstructions: z
      .string()
      .optional()
      .describe('Dynamic schema instructions built from SchemaRegistry'),
    availableSchemas: z
      .array(
        z.object({
          schemaId: z.string(),
          name: z.string(),
          description: z.string().optional(),
          fields: z
            .array(
              z.object({
                id: z
                  .string()
                  .describe('The key to use for this field in the JSON object'),
                label: z
                  .string()
                  .describe('A user-friendly label for the field'),
                description: z
                  .string()
                  .optional()
                  .describe('A description of what the field represents'),
              })
            )
            .describe(
              'The list of fields that each item in this section should have'
            ),
        })
      )
      .optional()
      .describe(
        'Available section schemas from SchemaRegistry, including their fields'
      ),
  })
);

// Schema for getJobInfoFromImage
export const JobInfoFromImageInputSchema = ai.defineSchema(
  'JobInfoFromImageInputSchema',
  z.object({
    dataUri: z
      .string()
      .describe(
        'A full data URI for the image (e.g., data:image/png;base64,...)'
      ),
  })
);

// NEW: Schema for the output of getJobInfoFromImage
export const JobInfoFromImageOutputSchema = ai.defineSchema(
  'JobInfoFromImageOutputSchema',
  z.object({
    extractedText: z
      .string()
      .describe('The extracted job information text from the image.'),
  })
);

// Schemas for improve-resume-section
export const ImproveResumeSectionInputSchema = ai.defineSchema(
  'ImproveResumeSectionInputSchema',
  z.object({
    resumeSection: z
      .string()
      .describe('The text content of the resume section to be improved.'),
    prompt: z
      .string()
      .describe(
        'A prompt providing instructions on how to improve the resume section.'
      ),
    context: z
      .object({
        currentItemContext: z
          .string()
          .describe('Context about the current item being improved'),
        otherSectionsContext: z
          .string()
          .describe('Summary of other resume sections'),
        userJobTitle: z
          .string()
          .optional()
          .describe("The user's target job title"),
        userJobInfo: z
          .string()
          .optional()
          .describe("The user's target job info"),
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
    improvedResumeSection: z
      .string()
      .describe('The AI-rewritten and improved resume section.'),
  })
);

// --- NEW SCHEMA FOR CONTEXT GENERATION (V3 - JSON String Wrapper) ---

export const GeneratedResumeAsStringSchema = ai.defineSchema(
  'GeneratedResumeAsStringSchema',
  z.object({
    resumeJson: z
      .string()
      .describe(
        'A string containing the full resume data as a JSON object. This string will be parsed by the application.'
      ),
  })
);

export const ReviewResumeInputSchema = ai.defineSchema(
  'ReviewResumeInputSchema',
  z.object({
    resumeText: z
      .string()
      .describe('The complete text content of the resume to be reviewed.'),
  })
);

export const ReviewResumeOutputSchema = ai.defineSchema(
  'ReviewResumeOutputSchema',
  z.object({
    overallQuality: z
      .string()
      .describe('An overall assessment of the resume quality.'),
    suggestions: z
      .string()
      .describe('Specific, actionable suggestions for improving the resume.'),
  })
);

// --- COVER LETTER GENERATION SCHEMAS ---

export const GenerateCoverLetterInputSchema = ai.defineSchema(
  'GenerateCoverLetterInputSchema',
  z.object({
    resumeContext: z
      .string()
      .describe(
        "Structured summary of the user's resume including skills, experience, and background"
      ),
    targetJobInfo: z
      .string()
      .describe(
        'Information about the target job position, company, and requirements'
      ),
    targetCompany: z
      .string()
      .optional()
      .describe('Specific company name if available'),
    context: z
      .object({
        userJobTitle: z
          .string()
          .optional()
          .describe("The user's target job title"),
        userBio: z.string().optional().describe("The user's professional bio"),
      })
      .optional()
      .describe('Additional user context for personalization'),
  })
);

export const GenerateCoverLetterOutputSchema = ai.defineSchema(
  'GenerateCoverLetterOutputSchema',
  z.object({
    coverLetterContent: z
      .string()
      .describe(
        'The complete, professionally written cover letter content in markdown format'
      ),
    generationSummary: z
      .string()
      .describe(
        'A brief summary of key themes and focus areas highlighted in the cover letter'
      ),
  })
);
