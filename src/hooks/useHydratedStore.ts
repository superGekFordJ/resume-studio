import { useState, useEffect } from 'react';
import type { StoreApi, UseBoundStore } from 'zustand';

/**
 * Hook to safely use Zustand stores with SSR/hydration
 * This prevents hydration mismatch by only returning the store state after client-side mount
 * 
 * @param store - The Zustand store
 * @param selector - Selector function to pick specific state
 * @returns The selected state or null during SSR/initial render
 */
export function useHydratedStore<TState, TResult>(
  store: UseBoundStore<StoreApi<TState>>,
  selector: (state: TState) => TResult
): TResult | null {
  const [hydrated, setHydrated] = useState(false);
  const storeState = store(selector);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Return null during SSR and initial client render to prevent hydration mismatch
  if (!hydrated) {
    return null;
  }

  return storeState;
} 