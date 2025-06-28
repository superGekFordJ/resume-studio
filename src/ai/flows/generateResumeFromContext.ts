'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Zod schema for the AI's structured JSON output.
// NOTE: PersonalDetails has been removed. The AI should not generate this.
const AIGeneratedExperienceSchema = z.object({
  jobTitle: z.string(),
  company: z.string(),
  startDate: z.string().describe("Start date, e.g., 'YYYY-MM' or 'Month YYYY'."),
  endDate: z.string().describe("End date, can be 'Present'."),
  description: z.string().describe("A bulleted list of achievements and responsibilities, formatted as a single string with newlines."),
});

const AIGeneratedEducationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  graduationYear: z.string(),
  details: z.string().optional().describe("Optional details like GPA or honors."),
});

const AIGeneratedSkillSchema = z.object({
  name: z.string(),
  category: z.string().describe("e.g., 'Programming Languages', 'Tools', 'Soft Skills'"),
});

const AIGeneratedResumeDataSchema = z.object({
  summary: z.string().describe("A 2-4 sentence professional summary tailored to the job description."),
  experience: z.array(AIGeneratedExperienceSchema).describe("Professional work experience."),
  education: z.array(AIGeneratedEducationSchema).describe("Educational background."),
  skills: z.array(AIGeneratedSkillSchema).describe("A list of relevant skills with categories."),
});
export type AIGeneratedResumeData = z.infer<typeof AIGeneratedResumeDataSchema>;


// Input schema for the flow itself.
const GenerateResumeContextInputSchema = z.object({
  bio: z.string().describe("The user's professional background and history."),
  jobDescription: z.string().describe("The target job description."),
});
type GenerateResumeContextInput = z.infer<typeof GenerateResumeContextInputSchema>;


const generateResumePrompt = ai.definePrompt(
  {
    name: 'generateResumePrompt',
    input: { schema: GenerateResumeContextInputSchema },
    output: { schema: AIGeneratedResumeDataSchema },
    prompt: `You are an expert resume writer. A user has provided their professional background (from an old resume or bio) and a target job description. Your task is to generate the core content of a new, high-quality resume tailored to this job.

Respond ONLY with a JSON object that strictly adheres to the provided schema. Do not include personal details like name, email, or phone.

**Instructions for each section:**

*   **summary**: Write a compelling 2-4 sentence professional summary. It should immediately grab the reader's attention and highlight the user's key qualifications as they relate to the target job description.
*   **experience**: Analyze the user's bio and the job description. Create detailed entries for their work history. For each role, use strong action verbs and focus on quantifiable achievements (e.g., "Increased sales by 20%", "Reduced server costs by 15%"). The description should be a single string with bullet points denoted by newlines (\n- ).
*   **education**: Extract the user's educational background. List their degrees, institutions, and graduation years.
*   **skills**: Identify all relevant technical and soft skills from the user's bio. Categorize them logically (e.g., "Programming Languages", "Cloud Technologies", "Developer Tools", "Soft Skills").

User's Professional Bio / Old Resume Content:
---
{{{bio}}}
---

Target Job Description:
---
{{{jobDescription}}}
---
`,
    config: {
      temperature: 0.3,
    },
  },
);

export const generateResumeFromContext = ai.defineFlow(
  {
    name: 'generateResumeFromContextFlow',
    inputSchema: GenerateResumeContextInputSchema,
    outputSchema: AIGeneratedResumeDataSchema,
  },
  async (input: GenerateResumeContextInput) => {
    const { output } = await generateResumePrompt(input);
    if (!output) {
      throw new Error('AI failed to generate a resume. The output was empty.');
    }
    return output;
  }
); 