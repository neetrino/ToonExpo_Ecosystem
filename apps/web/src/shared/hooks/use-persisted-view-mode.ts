'use client';

import { useCallback, useEffect, useState } from 'react';

import { useMinWidth } from '@/shared/hooks/use-min-width';
import { isViewMode, VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

const STORAGE_PREFIX = 'toonexpo.view-mode.v2.';

type UsePersistedViewModeResult = {
  /** Stored preference (desktop toggle). */
  viewMode: ViewMode;
  /** Cards on mobile; stored preference on desktop. */
  effectiveViewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
};

/**
 * Persists list/cards preference in localStorage for a named surface.
 * Defaults to cards when no preference is stored.
 * On viewports below `md`, always renders as cards (list is desktop-only).
 */
export const usePersistedViewMode = (
  storageKey: string,
  defaultMode: ViewMode = VIEW_MODE_CARDS,
): UsePersistedViewModeResult => {
  const [viewMode, setViewModeState] = useState<ViewMode>(defaultMode);
  const isDesktop = useMinWidth();

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

  return {
    viewMode,
    effectiveViewMode: isDesktop ? viewMode : VIEW_MODE_CARDS,
    setViewMode,
  };
};
