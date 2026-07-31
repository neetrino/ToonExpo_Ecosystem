'use client';

import { useEffect, useState } from 'react';

import { detectWebglSupport } from '@/features/geo-map/utils/detect-webgl-support';

/**
 * Client-only WebGL availability check. Defaults to `true` for the first paint
 * (SSR-safe) and settles to the real value after mount.
 */
export const useWebglSupport = (): boolean => {
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(detectWebglSupport());
  }, []);

  return isSupported;
};
