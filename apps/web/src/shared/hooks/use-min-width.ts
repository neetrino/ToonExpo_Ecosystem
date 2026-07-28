'use client';

import { useEffect, useState } from 'react';

/**
 * `true` when viewport is at least `minWidthPx` (defaults to Tailwind `md` = 768).
 * Mobile-first: starts `false` so SSR / first paint prefer the mobile layout.
 */
export const useMinWidth = (minWidthPx = 768): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(min-width: ${minWidthPx}px)`);
    const sync = (): void => {
      setMatches(media.matches);
    };
    sync();
    media.addEventListener('change', sync);
    return () => {
      media.removeEventListener('change', sync);
    };
  }, [minWidthPx]);

  return matches;
};
