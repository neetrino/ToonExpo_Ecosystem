'use client';

import { useCallback, useEffect, useState } from 'react';

import { HOME_HERO_ROTATE_MS } from '@/features/catalog/constants/home-hero';

export type HomeHeroRotation = {
  activeIndex: number;
  canRotate: boolean;
  goBy: (step: -1 | 1) => void;
};

/**
 * Auto-advances hero slides and restarts the timer after manual prev/next.
 * Honors `prefers-reduced-motion` (autoplay off; buttons still work).
 */
export const useHomeHeroRotation = (slideCount: number): HomeHeroRotation => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotationEpoch, setRotationEpoch] = useState(0);
  const canRotate = slideCount > 1;

  useEffect(() => {
    if (!canRotate) {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      return;
    }

    const timerId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideCount);
    }, HOME_HERO_ROTATE_MS);

    return () => {
      window.clearInterval(timerId);
    };
  }, [canRotate, slideCount, rotationEpoch]);

  const goBy = useCallback(
    (step: -1 | 1) => {
      if (!canRotate) {
        return;
      }

      setActiveIndex((current) => (current + step + slideCount) % slideCount);
      setRotationEpoch((epoch) => epoch + 1);
    },
    [canRotate, slideCount],
  );

  return { activeIndex, canRotate, goBy };
};
