import { get, set, del } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

// This custom storage implementation tells Zustand how to interface with IndexedDB.
// It only deals with strings; the `createJSONStorage` wrapper will handle serialization.
export const indexedDbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // console.log(`(IndexedDB) Getting item: ${name}`);
    const value = await get(name);
    return value || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    // console.log(`(IndexedDB) Setting item: ${name}`);
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    // console.log(`(IndexedDB) Removing item: ${name}`);
    await del(name);
  },
};
