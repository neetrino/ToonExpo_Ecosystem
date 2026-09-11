import { describe, expect, it, vi } from 'vitest';

import { mapStyleIsReady } from '@/features/geo-map/utils/map-style-is-ready';

describe('mapStyleIsReady', () => {
  it('is false when the style was torn down, without calling isStyleLoaded', () => {
    const isStyleLoaded = vi.fn(() => {
      throw new Error('isStyleLoaded should not run');
    });
    expect(mapStyleIsReady({ style: null, isStyleLoaded } as never)).toBe(false);
    expect(isStyleLoaded).not.toHaveBeenCalled();
  });

  it('is true only when the current style reports loaded', () => {
    expect(
      mapStyleIsReady({ style: { loaded: () => true }, isStyleLoaded: () => true } as never),
    ).toBe(true);
    expect(
      mapStyleIsReady({ style: { loaded: () => false }, isStyleLoaded: () => false } as never),
    ).toBe(false);
  });
});
