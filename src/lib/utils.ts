import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generic LRU Cache implementation with O(1) operations
 * @template K - Key type
 * @template V - Value type
 */
export class LRUCache<K, V> {
  private readonly capacity: number;
  private readonly cache = new Map<K, V>();

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing key
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Generates a stable hash from an object by sorting keys during JSON serialization
 * @param obj - Object to hash
 * @returns Stable hash string
 */
export function stableHash(obj: unknown): string {
  if (obj === null || obj === undefined) {
    return 'null';
  }

  // Handle non-objects and arrays recursively
  if (typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return `[${obj.map(stableHash).join(',')}]`;
  }

  // Handle objects by sorting keys and hashing values recursively
  const sortedKeys = Object.keys(obj as Record<string, unknown>).sort();
  const parts = sortedKeys.map((key) => {
    const value = (obj as Record<string, unknown>)[key];
    // Keys must also be stringified to handle special characters
    return `${JSON.stringify(key)}:${stableHash(value)}`;
  });

  return `{${parts.join(',')}}`;
}

/**
 * Maps error objects to user-friendly toast configurations
 * @param error - Error object to map
 * @returns Toast configuration object
 */
export function mapErrorToToast(error: unknown): {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
} {
  const showVerbose = process.env.NEXT_PUBLIC_SHOW_VERBOSE_AI_ERRORS === 'true';

  let title = 'An Unknown Error Occurred';
  let description = "We've logged the issue. Please feel free to try again.";

  // Type guard for error objects with status property
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: number }).code;

    switch (code) {
      case 400:
        title = 'Request Error';
        description =
          'The request seems to be malformed. Please try again later.';
        break;
      case 403:
        title = 'Authentication Failed';
        description = 'Please check if your API key is configured correctly.';
        break;
      case 429:
        title = 'Rate Limit Exceeded';
        description =
          "You're making too many requests. Please wait a moment and try again.";
        break;
      case 500:
        title = 'AI Service Error';
        description =
          'The AI service encountered an internal issue. Please try again later.';
        break;
      case 503:
        title = 'AI Service Unavailable';
        description =
          'The AI service is currently overloaded. Please try again later.';
        break;
    }
  }

  // Type guard for error objects with code property
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: string }).status;

    switch (status) {
      case 'INVALID_ARGUMENT':
        title = 'Request Error';
        description =
          'The request seems to be malformed. Please try again later.';
        break;
      case 'PERMISSION_DENIED':
        title = 'Authentication Failed';
        description = 'Please check if your API key is configured correctly.';
        break;
      case 'RESOURCE_EXHAUSTED':
        title = 'Rate Limit Exceeded';
        description =
          "You're making too many requests. Please wait a moment and try again.";
        break;
      case 'INTERNAL':
        title = 'AI Service Error';
        description =
          'The AI service encountered an internal issue. Please try again later.';
        break;
      case 'UNAVAILABLE':
        title = 'AI Service Unavailable';
        description =
          'The AI service is currently overloaded. Please try again later.';
        break;
    }
  }

  // Add verbose details if enabled
  if (showVerbose && error instanceof Error) {
    description += ` (${error.message})`;
  }

  return {
    title,
    description,
    variant: 'destructive',
  };
}
