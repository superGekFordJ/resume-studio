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