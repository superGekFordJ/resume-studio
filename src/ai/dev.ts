import { config } from 'dotenv';
config();

import '@/ai/flows/autocomplete-input.ts';
import '@/ai/flows/review-resume.ts';
import '@/ai/flows/improve-resume-section.ts';
import '@/ai/flows/batch-improve-section.ts';
import '@/ai/flows/generateResumeFromContext.ts';
import '@/ai/flows/getJobInfoFromImage.ts';
import '@/ai/flows/generateCoverLetter.ts';