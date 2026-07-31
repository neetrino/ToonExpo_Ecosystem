import { describe, expect, it } from 'vitest';

import { BRAND_MAP_PAINT_OVERRIDES } from '@/features/geo-map/utils/apply-brand-map-style';
import {
  computeMarkerFadeOpacity,
  computeModelFadeOpacity,
  resolveLayerMinZoom,
} from '@/features/geo-map/utils/zoom-fade-opacity';

describe('BRAND_MAP_PAINT_OVERRIDES', () => {
  it('targets known liberty layer ids without duplicates of the same property', () => {
    const keys = BRAND_MAP_PAINT_OVERRIDES.map(
      (override) => `${override.layerId}:${override.property}`,
    );
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.some((key) => key.startsWith('water:'))).toBe(true);
    expect(keys.some((key) => key.startsWith('park:'))).toBe(true);
    expect(keys.some((key) => key.startsWith('building:'))).toBe(true);
  });
});

describe('zoom-fade-opacity', () => {
  it('fades markers out as zoom approaches minZoom', () => {
    expect(computeMarkerFadeOpacity(12, 14)).toBe(1);
    expect(computeMarkerFadeOpacity(13.25, 14)).toBeCloseTo(1);
    expect(computeMarkerFadeOpacity(13.625, 14)).toBeCloseTo(0.5);
    expect(computeMarkerFadeOpacity(14, 14)).toBe(0);
  });

  it('fades models in after minZoom', () => {
    expect(computeModelFadeOpacity(13.9, 14)).toBe(0);
    expect(computeModelFadeOpacity(14, 14)).toBeGreaterThan(0.4);
    expect(computeModelFadeOpacity(14.75, 14)).toBe(1);
  });

  it('resolves the lowest minZoom for a layer', () => {
    expect(resolveLayerMinZoom([])).toBeNull();
    expect(resolveLayerMinZoom([16, 14, 15])).toBe(14);
  });
});
