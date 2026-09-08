'use client';

import { useEffect, useRef, useState } from 'react';

/** Like useState, but persists to localStorage so the value survives a full page
 *  refresh. Starts at `initialValue` on both the server and the first client render
 *  (SSR-safe - never causes a hydration mismatch), then swaps in the saved value right
 *  after mount. `hydrated` flips to true once that swap has happened, for callers that
 *  need to distinguish "genuinely empty" from "not loaded from storage yet". */
export function usePersistedState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) setState(JSON.parse(saved));
    } catch (error) {
      console.error(`Failed to read persisted state for "${key}":`, error);
    }
    hydratedRef.current = true;
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Failed to persist state for "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState, hydrated] as const;
}
