import { z } from 'genkit';

// NEW: Schemas for AIDataBridge
export const AIBridgedSectionSchema = z.object({
    schemaId: z.string().describe('The schema ID of the section (e.g., experience, education)'),
    // Define items as an array of records (string keys, any values) which is a standard for dynamic objects.
    items: z
      .array(z.record(z.string(), z.any()))
      .describe('Array of items with dynamic fields based on the schema'),
});

export const AIBridgedResumeSchema = z.object({
    sections: z.array(AIBridgedSectionSchema).describe('Array of sections in the resume'),
});

export const AutocompleteInputSchema = z.object({
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
    aiConfig: z.any().describe('The AI configuration object from the store. Passed to AIManager.'),
    // Keep sectionType for backward compatibility
    sectionType: z
      .string()
      .optional()
      .describe('The type of resume section being edited'),
});

export const AutocompleteOutputSchema = z.object({
    completion: z
      .string()
      .describe(
        'The AI-suggested autocompletion text. Should be concise (e.g., a phrase or 1-2 short sentences, or a few key phrases).'
      ),
});

export const BatchImproveSectionInputSchema = z.object({
    section: AIBridgedSectionSchema,
    improvementGoals: z
      .array(z.string())
      .describe('List of improvement goals'),
    userJobTitle: z.string().optional(),
    userJobInfo: z.string().optional(),
    userBio: z.string().optional(),
    aiConfig: z.any().describe('The AI configuration object from the store. Passed to AIManager.'),
    otherSectionsContext: z.string().optional(),
});

export const BatchImproveSectionOutputSchema = z.object({
    improvedSection: AIBridgedSectionSchema,
    improvementSummary: z.string(),
});

// NEW: Wrapper schema for batch improvement to avoid 400 errors with dynamic JSON
export const BatchImproveSectionOutputWrapperSchema = z.object({
    improvedSectionJson: z.string().describe("The improved section data as a single, JSON-escaped string containing the AIBridgedSection structure."),
    improvementSummary: z.string().describe("A summary of the changes made."),
});

export const ComprehensiveResumeAnalysisInputSchema = z.object({
    resumeData: z.record(z.any()).describe('Complete resume data'),
    analysisType: z
      .enum(['ats-optimization', 'content-enhancement', 'structure-improvement', 'industry-alignment'])
      .describe('Type of analysis to perform'),
    targetRole: z.string().optional().describe('Target job role for optimization'),
    industryContext: z.string().optional().describe('Target industry context'),
    experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']).optional().describe('Career level'),
    aiConfig: z.any().describe('The AI configuration object from the store.'),
});

export const ComprehensiveResumeAnalysisOutputSchema = z.object({
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
});

// DEPRECATED: Old schemas for generateResumeFromContext - will be removed after migration
export const AIGeneratedExperienceSchema = z.object({
    jobTitle: z.string(),
    company: z.string(),
    startDate: z.string().describe("Start date, e.g., 'YYYY-MM' or 'Month YYYY'."),
    endDate: z.string().describe("End date, can be 'Present'."),
    description: z
      .string()
      .describe('A bulleted list of achievements and responsibilities, formatted as a single string with newlines.'),
});

export const AIGeneratedEducationSchema = z.object({
    degree: z.string(),
    institution: z.string(),
    graduationYear: z.string(),
    details: z.string().optional().describe('Optional details like GPA or honors.'),
});

export const AIGeneratedSkillSchema = z.object({
    name: z.string(),
    category: z.string().describe("e.g., 'Programming Languages', 'Tools', 'Soft Skills'"),
});

export const AIGeneratedResumeDataSchema = z.object({
    summary: z.string().describe('A 2-4 sentence professional summary tailored to the job description.'),
    experience: z.array(AIGeneratedExperienceSchema).describe('Professional work experience.'),
    education: z.array(AIGeneratedEducationSchema).describe('Educational background.'),
    skills: z.array(AIGeneratedSkillSchema).describe('A list of relevant skills with categories.'),
});

export const GenerateResumeContextInputSchema = z.object({
    bio: z.string().describe("The user's professional background and history."),
    jobDescription: z.string().describe('The target job description.'),
    schemaInstructions: z.string().optional().describe('Dynamic schema instructions built from SchemaRegistry'),
    availableSchemas: z.array(z.object({
      schemaId: z.string(),
      name: z.string(),
      description: z.string().optional(),
      fields: z.array(z.object({
        id: z.string().describe('The key to use for this field in the JSON object'),
        label: z.string().describe('A user-friendly label for the field'),
        description: z.string().optional().describe('A description of what the field represents'),
      })).describe('The list of fields that each item in this section should have'),
    })).optional().describe('Available section schemas from SchemaRegistry, including their fields'),
    aiConfig: z.any().describe('The AI configuration object from the store.'),
});

// Schema for getJobInfoFromImage
export const JobInfoFromImageInputSchema = z.object({
    dataUri: z.string().describe('A full data URI for the image (e.g., data:image/png;base64,...)'),
    aiConfig: z.any().describe('The AI configuration object from the store.'),
});

// NEW: Schema for the output of getJobInfoFromImage
export const JobInfoFromImageOutputSchema = z.object({
    extractedText: z.string().describe('The extracted job information text from the image.'),
});


// Schemas for improve-resume-section
export const ImproveResumeSectionInputSchema = z.object({
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
    aiConfig: z.any().describe('The AI configuration object from the store.'),
});

export const ImproveResumeSectionOutputSchema = z.object({
    improvedResumeSection: z.string().describe('The AI-rewritten and improved resume section.'),
});

// Schemas for review-resume
export const ResumeReviewInputSchema = z.object({
  resumeText: z.string().describe('The complete text content of the resume to be reviewed.'),
  aiConfig: z.any().describe('The AI configuration object from the store.'),
});

export const ResumeReviewOutputSchema = z.object({
  overallQuality: z.string().describe('An overall assessment of the resume quality.'),
  suggestions: z
    .string()
    .describe('Specific, actionable suggestions for improving the resume.'),
});

// --- NEW SCHEMA FOR CONTEXT GENERATION (V3 - JSON String Wrapper) ---

export const GeneratedResumeAsStringSchema = z.object({
    resumeJson: z.string().describe("A string containing the full resume data as a JSON object. This string will be parsed by the application."),
});

// @deprecated - Will be removed after migration to AIBridgedResumeSchema
export const GeneratedExperienceItemSchema = z.object({
  jobTitle: z.string(),
  company: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string().describe("A bulleted or paragraph description of responsibilities and achievements."),
});

// @deprecated - Will be removed after migration to AIBridgedResumeSchema  
export const GeneratedEducationItemSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  graduationYear: z.string(),
  details: z.string().optional(),
});

// @deprecated - Will be removed after migration to AIBridgedResumeSchema
export const GeneratedSkillsItemSchema = z.object({
  name: z.string().describe("The name of the skill."),
});

// @deprecated - Will be removed after migration to AIBridgedResumeSchema
export const GeneratedSummaryItemSchema = z.object({
    content: z.string().describe("The full text of the professional summary."),
});

// @deprecated - Will be removed after migration to AIBridgedResumeSchema
export const GeneratedResumeContentSchema = z.object({
    summary: z.array(GeneratedSummaryItemSchema).describe("The professional summary section. Should contain exactly one item."),
    experience: z.array(GeneratedExperienceItemSchema).describe("The work experience section."),
    education: z.array(GeneratedEducationItemSchema).describe("The education section."),
    skills: z.array(GeneratedSkillsItemSchema).describe("The skills section."),
}).describe("A structured representation of the core content of a resume.");

// --- COVER LETTER GENERATION SCHEMAS ---

export const GenerateCoverLetterInputSchema = z.object({
    resumeContext: z.string().describe('Structured summary of the user\'s resume including skills, experience, and background'),
    targetJobInfo: z.string().describe('Information about the target job position, company, and requirements'),
    targetCompany: z.string().optional().describe('Specific company name if available'),
    context: z
      .object({
        userJobTitle: z.string().optional().describe("The user's target job title"),
        userBio: z.string().optional().describe("The user's professional bio"),
      })
      .optional()
      .describe('Additional user context for personalization'),
    aiConfig: z.any().describe('The AI configuration object from the store.'),
});

export const GenerateCoverLetterOutputSchema = z.object({
    coverLetterContent: z.string().describe('The complete, professionally written cover letter content in markdown format'),
    generationSummary: z.string().describe('A brief summary of key themes and focus areas highlighted in the cover letter'),
});

export const ReviewResumeInputSchema = z.object({
    resumeText: z.string().describe('The complete text content of the resume to be reviewed.'),
    aiConfig: z.any().describe('The AI configuration object from the store.'),
});

export const ReviewResumeOutputSchema = z.object({
    overallQuality: z.string().describe('An overall assessment of the resume quality.'),
    suggestions: z.string().describe('Specific, actionable suggestions for improving the resume.'),
});