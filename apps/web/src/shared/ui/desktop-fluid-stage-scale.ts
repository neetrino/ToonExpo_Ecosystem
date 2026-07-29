'use client';

import { useEffect, useState } from 'react';

const STAGE_SELECTOR = '.desktop-fluid-stage';
const DEFAULT_SCALE = 1;

/**
 * Visual scale of `.desktop-fluid-stage` (CSS `zoom` on desktop).
 * Returns 1 when the stage is absent or unscaled.
 */
export const getDesktopFluidStageScale = (): number => {
  if (typeof document === 'undefined') {
    return DEFAULT_SCALE;
  }
  const stage = document.querySelector(STAGE_SELECTOR);
  if (!(stage instanceof HTMLElement)) {
    return DEFAULT_SCALE;
  }
  const layoutWidth = stage.offsetWidth;
  if (layoutWidth <= 0) {
    return DEFAULT_SCALE;
  }
  const visualWidth = stage.getBoundingClientRect().width;
  const scale = visualWidth / layoutWidth;
  if (!Number.isFinite(scale) || scale <= 0.01) {
    return DEFAULT_SCALE;
  }
  return scale;
};

/**
 * Tracks desktop fluid zoom so portaled CRM drag cards keep board appearance.
 */
export const useDesktopFluidStageScale = (): number => {
  const [scale, setScale] = useState(DEFAULT_SCALE);

  useEffect(() => {
    const update = (): void => {
      setScale(getDesktopFluidStageScale());
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return scale;
};
