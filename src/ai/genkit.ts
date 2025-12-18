import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  promptDir: 'src/ai/prompts',
});

// Define a helper to format the current date for cover letters
ai.defineHelper('formatCurrentDate', () => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return now.toLocaleDateString('en-US', options);
});

ai.defineHelper('eq', (a: unknown, b: unknown) => a === b);

ai.defineHelper('getSectionImprovementGuidelines', (schemaId: string) => {
  const baseGuideline = `As an expert resume editor, your task is to refine the user's input based on their improvement goals, while strictly adhering to the provided JSON schema.`;

  switch (schemaId) {
    case 'experience':
    case 'projects':
      return `${baseGuideline} For this section, focus on transforming responsibilities into achievements.
- Rewrite bullet points using the STAR (Situation, Task, Action, Result) method where possible.
- Enhance impact by adding quantifiable metrics (e.g., numbers, percentages, dollar amounts).
- Replace passive language with strong, industry-specific action verbs.`;
    case 'skills':
    case `advanced-skills`:
      return `${baseGuideline} Your goal is to structure and refine the user's skills for clarity and impact.
- Organize the skills into logical categories if they are not already.
- Refine skill levels to be more descriptive (e.g., "Proficient in Python" instead of just "Python").
- Suggest adding specific technologies or tools relevant to the user's other experience.`;
    case 'education':
      return `${baseGuideline} Refine the education section to highlight relevant academic achievements.
- Elaborate on degrees or coursework to better align with the user's career goals.
- Ensure formatting for GPA or honors is professional and clear.`;
    case 'summary':
      return `${baseGuideline} Your task is to rewrite the user's summary into a compelling professional pitch.
- Synthesize the user's bio and experience into a concise 2-4 sentence summary.
- Start with a strong, descriptive title/adjective (e.g., "Results-driven Marketing Manager...").
- Weave in 2-3 key achievements or qualifications that directly align with their stated job target.`;
    default:
      return `${baseGuideline}
- Improve clarity, conciseness, and professional tone.
- Correct any spelling, grammar, or punctuation errors.
- Ensure the language is active and impactful.`;
  }
});
