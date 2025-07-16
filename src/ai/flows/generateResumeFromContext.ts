'use server';

import { aiManager } from '@/ai/AIManager';
import { z } from 'genkit';
import {
  GenerateResumeContextInputSchema,
  GeneratedResumeAsStringSchema,
  AIBridgedResumeSchema,
} from '../prompts/schemas';
import _ from 'lodash';

export type AIBridgedResume = z.infer<typeof AIBridgedResumeSchema>;
type GenerateResumeContextInput = z.infer<
  typeof GenerateResumeContextInputSchema
>;

const flowCache = new Map<string, any>();

export async function generateResumeFromContext(
  input: GenerateResumeContextInput
): Promise<AIBridgedResume> {
  const cacheKey = JSON.stringify(_.pick(input.aiConfig, ['provider', 'apiKey']));
  let generateResumeFromContextFlow = flowCache.get(cacheKey);

  if (!generateResumeFromContextFlow) {
    const ai = aiManager.getGenkit(input.aiConfig);
    generateResumeFromContextFlow = ai.defineFlow(
      {
        name: `generateResumeFromContextFlow_${flowCache.size}`,
        inputSchema: GenerateResumeContextInputSchema,
        outputSchema: AIBridgedResumeSchema,
      },
      async (flowInput: GenerateResumeContextInput): Promise<AIBridgedResume> => {
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
          ...flowInput,
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
    flowCache.set(cacheKey, generateResumeFromContextFlow);
  }

  return generateResumeFromContextFlow(input);
}