'use client';

import { useEffect, useState } from 'react';

import { detectWebglSupport } from '@/features/geo-map/utils/detect-webgl-support';

/**
 * Client-only WebGL availability check.
 * Returns `null` until mount completes, then a stable support boolean.
 */
export const useWebglSupport = (): boolean | null => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setIsSupported(detectWebglSupport());
  }, []);

  return isSupported;
};
