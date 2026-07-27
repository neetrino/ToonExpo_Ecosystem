import type { Viewport } from 'next';

/**
 * `viewportFit: 'cover'` enables `env(safe-area-inset-*)` on notched iPhones.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};
