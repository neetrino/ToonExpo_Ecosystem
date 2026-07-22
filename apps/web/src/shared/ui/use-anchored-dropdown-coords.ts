'use client';

import { type RefObject, useCallback, useLayoutEffect, useState } from 'react';

const DROPDOWN_GAP_PX = 6;

export type AnchoredDropdownCoords = {
  top: number;
  right: number;
};

/**
 * Keeps a fixed-position dropdown anchored under a trigger (viewport coordinates).
 */
export const useAnchoredDropdownCoords = (
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
): AnchoredDropdownCoords | null => {
  const [coords, setCoords] = useState<AnchoredDropdownCoords | null>(null);

  const updateCoords = useCallback(() => {
    const node = triggerRef.current;
    if (!node) {
      setCoords(null);
      return;
    }
    const rect = node.getBoundingClientRect();
    setCoords({
      top: rect.bottom + DROPDOWN_GAP_PX,
      right: Math.max(0, window.innerWidth - rect.right),
    });
  }, [triggerRef]);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }

    updateCoords();
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [open, updateCoords]);

  return open ? coords : null;
};
