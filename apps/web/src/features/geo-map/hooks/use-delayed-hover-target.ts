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
 *
 * Pin leave schedules a close; card enter cancels it. While the card is held,
 * further pin-leave events are ignored so the card stays interactive.
 */
export const useDelayedHoverTarget = (): DelayedHoverTarget => {
  const [targetId, setTarget] = useState<string | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCardHeldRef = useRef(false);

  const clearCloseTimeout = useCallback((): void => {
    if (closeTimeoutRef.current !== null) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const holdTarget = useCallback((): void => {
    isCardHeldRef.current = true;
    clearCloseTimeout();
  }, [clearCloseTimeout]);

  const scheduleClose = useCallback((): void => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null;
      if (isCardHeldRef.current) {
        return;
      }
      setTarget(null);
    }, GEO_MAP_HOVER_CARD_CLOSE_DELAY_MS);
  }, [clearCloseTimeout]);

  const releaseTarget = useCallback((): void => {
    isCardHeldRef.current = false;
    scheduleClose();
  }, [scheduleClose]);

  const setTargetId = useCallback(
    (id: string | null): void => {
      if (id === null) {
        if (isCardHeldRef.current) {
          return;
        }
        scheduleClose();
        return;
      }
      clearCloseTimeout();
      isCardHeldRef.current = false;
      setTarget(id);
    },
    [clearCloseTimeout, scheduleClose],
  );

  useEffect(() => () => clearCloseTimeout(), [clearCloseTimeout]);

  return { targetId, setTargetId, holdTarget, releaseTarget };
};
