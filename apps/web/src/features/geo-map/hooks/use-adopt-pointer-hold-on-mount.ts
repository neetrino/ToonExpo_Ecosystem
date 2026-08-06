'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * When a hover card mounts under the cursor, browsers often skip `pointerenter`.
 * If the hold zone already matches `:hover`, invoke `onPointerEnter` so a pending
 * close grace timer does not dismiss the card.
 */
export const useAdoptPointerHoldOnMount = (
  onPointerEnter: (() => void) | undefined,
  syncKey: string,
): RefObject<HTMLDivElement | null> => {
  const holdZoneRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!onPointerEnter || !holdZoneRef.current) {
      return;
    }
    const zone = holdZoneRef.current;
    const frame = requestAnimationFrame(() => {
      if (zone.matches(':hover')) {
        onPointerEnter();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [onPointerEnter, syncKey]);

  return holdZoneRef;
};
