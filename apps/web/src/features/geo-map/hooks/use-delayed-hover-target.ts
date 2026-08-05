'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { GEO_MAP_HOVER_CARD_CLOSE_DELAY_MS } from '@/features/geo-map/constants';

export type DelayedHoverTarget = {
  targetId: string | null;
  /** Marker hover: opens instantly, closes only after the grace delay. */
  setTargetId: (id: string | null) => void;
  /** Cancels a pending close while the pointer rests on the hover card. */
  holdTarget: () => void;
  /** Restarts the grace delay once the pointer leaves the hover card. */
  releaseTarget: () => void;
};

/**
 * Hover target with a close grace period, so the pointer can travel from a map
 * pin to its hover card (and click it) without the card disappearing.
 */
export const useDelayedHoverTarget = (): DelayedHoverTarget => {
  const [targetId, setTarget] = useState<string | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const holdTarget = useCallback((): void => {
    if (closeTimeoutRef.current !== null) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const releaseTarget = useCallback((): void => {
    holdTarget();
    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null;
      setTarget(null);
    }, GEO_MAP_HOVER_CARD_CLOSE_DELAY_MS);
  }, [holdTarget]);

  const setTargetId = useCallback(
    (id: string | null): void => {
      if (id === null) {
        releaseTarget();
        return;
      }
      holdTarget();
      setTarget(id);
    },
    [holdTarget, releaseTarget],
  );

  useEffect(() => holdTarget, [holdTarget]);

  return { targetId, setTargetId, holdTarget, releaseTarget };
};
