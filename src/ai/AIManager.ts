import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
// import { vertexAI } from '@genkit-ai/vertexai';
import type { AIConfig } from '@/stores/types';
import _ from 'lodash';

// Placeholder for ollama plugin - to be installed if needed
// import { ollama } from 'genkitx-ollama';

function createConfiguredGenkit(config: AIConfig) {
  const plugins: any[] = [];
  
  // DEVELOPMENT OPTIMIZATION: Prioritize UI key, fallback to .env, then no key
  let apiKeyToUse = config.apiKey;
  if (!apiKeyToUse && process.env.NODE_ENV === 'development') {
    if (config.provider === 'google') {
      apiKeyToUse = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    } else if (config.provider === 'anthropic') {
      apiKeyToUse = process.env.ANTHROPIC_API_KEY;
    }
    // Add other providers like process.env.OLLAMA_API_KEY here if needed
  }

  if (config.provider === 'google') {
    plugins.push(googleAI({ apiKey: apiKeyToUse }));
  } else if (config.provider === 'ollama') {
    // TODO: Uncomment when ollama plugin is installed
    // plugins.push(ollama({
    //   models: [{ name: config.model, type: 'generate' }],
    //   serverAddress: config.ollamaServerAddress,
    // }));
    console.warn('Ollama support is not yet implemented. Please install genkitx-ollama package.');
    // Fallback to Google AI for now
    plugins.push(googleAI({ apiKey: process.env.GOOGLE_API_KEY }));
  } else if (config.provider === 'anthropic') {
    // TODO: Implement Anthropic support
    console.warn('Anthropic support is not yet implemented.');
    // Fallback to Google AI for now
    plugins.push(googleAI({ apiKey: process.env.GOOGLE_API_KEY }));
  }
  
  const ai = genkit({ 
    plugins,
    model: `googleai/${config.model}` // Default model
  });
  
  return ai;
}

class AIManager {
  private static instance: AIManager;
  private activeInstance: ReturnType<typeof genkit> | null = null;
  private activeConfig: AIConfig | null = null;

  private constructor() {}

  public static getInstance(): AIManager {
    if (!AIManager.instance) {
      AIManager.instance = new AIManager();
    }
    return AIManager.instance;
  }

  public getGenkit(config: AIConfig): ReturnType<typeof genkit> {
    // If config is the same as the active one, return the cached instance
    if (this.activeInstance && _.isEqual(this.activeConfig, config)) {
      return this.activeInstance;
    }

    // Otherwise, create a new instance, cache it, and return it
    const newInstance = createConfiguredGenkit(config);
    this.activeInstance = newInstance;
    this.activeConfig = _.cloneDeep(config); // Store a copy of the config
    return newInstance;
  }

  public getModel(config: AIConfig): string {
    // Map provider/model to the correct format for Genkit
    if (config.provider === 'google') {
      return `googleai/${config.model}`;
    } else if (config.provider === 'ollama') {
      // TODO: Update when ollama is properly integrated
      return config.model;
    } else if (config.provider === 'anthropic') {
      return `vertexai-modelgarden/${config.model}`;
    }
    return `googleai/gemini-2.0-flash`; // Default fallback
  }
}

export const aiManager = AIManager.getInstance(); 