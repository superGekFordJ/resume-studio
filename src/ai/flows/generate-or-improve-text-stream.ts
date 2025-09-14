'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  GenerateOrImproveTextInputSchema,
  GenerateOrImproveTextOutputSchema,
  StreamingTextChunkSchema,
} from '@/ai/prompts/schemas';

export type GenerateOrImproveTextInput = z.infer<
  typeof GenerateOrImproveTextInputSchema
>;
export type GenerateOrImproveTextOutput = z.infer<
  typeof GenerateOrImproveTextOutputSchema
>;

// Define a streaming Genkit flow. It streams string chunks and returns the final full text when done.
export const generateOrImproveTextStreamFlow = ai.defineFlow(
  {
    name: 'generateOrImproveTextStreamFlow',
    inputSchema: GenerateOrImproveTextInputSchema,
    outputSchema: GenerateOrImproveTextOutputSchema,
    streamSchema: StreamingTextChunkSchema,
  },
  async (
    input: GenerateOrImproveTextInput,
    { sendChunk }
  ): Promise<GenerateOrImproveTextOutput> => {
    // Use a dotprompt for instructions, and call it in streaming mode.
    const prompt = ai.prompt('generateOrImproveTextStream');

    const { stream, response } = prompt.stream(input);

    for await (const chunk of stream as AsyncGenerator<{ text?: string }>) {
      const text = chunk?.text ?? '';
      if (text) sendChunk(text);
    }

    const final = (await response) as { text?: string };
    const finalText = final?.text ?? '';
    return { finalText };
  }
);

export type GenerateOrImproveTextStreamFlowType =
  typeof generateOrImproveTextStreamFlow;

// Server action helper to expose a browser-consumable ReadableStream<string>
export async function generateOrImproveTextStream(
  input: GenerateOrImproveTextInput
): Promise<ReadableStream<string>> {
  const { stream } = generateOrImproveTextStreamFlow.stream(input);

  // Adapt Genkit's AsyncGenerator<string> to a Web ReadableStream<string>
  return new ReadableStream<string>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (typeof chunk === 'string' && chunk) {
            controller.enqueue(chunk);
          }
        }
      } catch (err) {
        console.error('[generateOrImproveTextStream] Streaming error:', err);
      } finally {
        controller.close();
      }
    },
  });
}
