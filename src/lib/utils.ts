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
