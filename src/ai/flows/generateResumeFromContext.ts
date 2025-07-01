'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  GenerateResumeContextInputSchema,
  GeneratedResumeAsStringSchema,
  AIBridgedResumeSchema,
} from '../prompts/schemas';

export type AIBridgedResume = z.infer<typeof AIBridgedResumeSchema>;
type GenerateResumeContextInput = z.infer<
  typeof GenerateResumeContextInputSchema
>;

export const generateResumeFromContext = ai.defineFlow(
  {
    name: 'generateResumeFromContextFlow',
    inputSchema: GenerateResumeContextInputSchema,
    outputSchema: AIBridgedResumeSchema,
  },
  async (input: GenerateResumeContextInput): Promise<AIBridgedResume> => {
    // Build dynamic schema instructions
    const { SchemaRegistry } = await import('@/lib/schemaRegistry');
    const { AIDataBridge } = await import('@/lib/aiDataBridge');
    
    const schemaRegistry = SchemaRegistry.getInstance();
    const schemaInstructions = AIDataBridge.buildSchemaInstructions(schemaRegistry);
    
    // Define a new prompt that uses the string wrapper schema
    const prompt = ai.prompt<
      typeof GenerateResumeContextInputSchema,
      typeof GeneratedResumeAsStringSchema
    >('generateResumeFromContext');
    
    const { output } = await prompt({
      ...input,
      schemaInstructions,
    });
    
    if (!output || !output.resumeJson) {
      throw new Error('AI failed to generate a resume. The output was empty or malformed.');
    }
    
    // Parse the JSON string from the AI's response
    const parsedJson = JSON.parse(output.resumeJson);
    
    // Validate the parsed JSON against our internal, robust schema
    const validationResult = AIBridgedResumeSchema.safeParse(parsedJson);
    
    if (!validationResult.success) {
      console.error("AI returned invalid JSON structure:", validationResult.error);
      throw new Error("AI returned JSON that did not match the expected structure.");
    }
    
    return validationResult.data;
  }
); 