'use client';

import { useCallback, useEffect, useState } from 'react';

import { useMinWidth } from '@/shared/hooks/use-min-width';

type UsePersistedRailCollapsedResult = {
  collapsed: boolean;
  /** False on mobile — collapse applies on desktop rail only. */
  effectiveCollapsed: boolean;
  setCollapsed: (next: boolean) => void;
  toggleCollapsed: () => void;
};

/**
 * Persists desktop portal rail collapsed state in localStorage.
 */
export const usePersistedRailCollapsed = (
  storageKey: string,
  enabled = true,
  defaultCollapsed = false,
): UsePersistedRailCollapsedResult => {
  const [collapsed, setCollapsedState] = useState(defaultCollapsed);
  const isDesktop = useMinWidth();

  useEffect(() => {
    if (!enabled) {
      return;
    }
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === 'true') {
        setCollapsedState(true);
      } else if (stored === 'false') {
        setCollapsedState(false);
      }
    } catch {
      // Ignore storage access errors (private mode, etc.).
    }
  }, [enabled, storageKey]);

  const persist = useCallback(
    (next: boolean): void => {
      if (!enabled) {
        return;
      }
      setCollapsedState(next);
      try {
        window.localStorage.setItem(storageKey, String(next));
      } catch {
        // Ignore storage write errors.
      }
    },
    [enabled, storageKey],
  );

  const toggleCollapsed = useCallback((): void => {
    persist(!collapsed);
  }, [collapsed, persist]);

  const effectiveCollapsed = enabled && isDesktop && collapsed;

  return {
    collapsed: enabled ? collapsed : false,
    effectiveCollapsed,
    setCollapsed: persist,
    toggleCollapsed,
  };
};
