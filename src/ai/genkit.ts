import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  promptDir: 'src/ai/prompts',
});

// Define a custom helper to build a data URI for multimodal prompts.
// This prevents template-in-template parsing issues.
ai.defineHelper(
  'buildDataUri',
  (contentType: string, base64: string) => `data:${contentType};base64,${base64}`
);

// Define a helper to format the current date for cover letters
ai.defineHelper(
  'formatCurrentDate',
  () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return now.toLocaleDateString('en-US', options);
  }
);