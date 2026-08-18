import type { Viewport } from 'next';

/**
 * Mobile-first viewport. `viewportFit: 'cover'` enables `env(safe-area-inset-*)`
 * on notched iPhones. Exported from the locale layout (not a Next special file).
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#092B44',
};
