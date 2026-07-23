'use client';

import { useCallback, useEffect, useState } from 'react';

import { isViewMode, VIEW_MODE_LIST, type ViewMode } from '@/shared/ui/view-mode';

const STORAGE_PREFIX = 'toonexpo.view-mode.';

type UsePersistedViewModeResult = {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
};

/**
 * Persists list/cards preference in localStorage for a named surface.
 */
export const usePersistedViewMode = (
  storageKey: string,
  defaultMode: ViewMode = VIEW_MODE_LIST,
): UsePersistedViewModeResult => {
  const [viewMode, setViewModeState] = useState<ViewMode>(defaultMode);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(`${STORAGE_PREFIX}${storageKey}`);
      if (isViewMode(stored)) {
        setViewModeState(stored);
      }
    } catch {
      // Ignore storage access errors (private mode, etc.).
    }
  }, [storageKey]);

  const setViewMode = useCallback(
    (mode: ViewMode): void => {
      setViewModeState(mode);
      try {
        window.localStorage.setItem(`${STORAGE_PREFIX}${storageKey}`, mode);
      } catch {
        // Ignore storage write errors.
      }
    },
    [storageKey],
  );

  return { viewMode, setViewMode };
};
