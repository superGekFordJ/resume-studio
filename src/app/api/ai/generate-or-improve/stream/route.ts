import { appRoute } from '@genkit-ai/next';
import { generateOrImproveTextStreamFlow } from '@/ai/flows/generate-or-improve-text-stream';

export const POST = appRoute(generateOrImproveTextStreamFlow);
