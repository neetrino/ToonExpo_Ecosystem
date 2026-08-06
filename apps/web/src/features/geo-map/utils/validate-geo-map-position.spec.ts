import { describe, expect, it } from 'vitest';

import { isValidGeoMapLngLat } from '@/features/geo-map/utils/validate-geo-map-position';

describe('isValidGeoMapLngLat', () => {
  it('accepts in-range coordinates', () => {
    expect(isValidGeoMapLngLat({ longitude: 44.5152, latitude: 40.1872 })).toBe(true);
    expect(isValidGeoMapLngLat({ longitude: -180, latitude: -90 })).toBe(true);
  });

  it('rejects non-finite coordinates', () => {
    expect(isValidGeoMapLngLat({ longitude: Number.NaN, latitude: 40.1872 })).toBe(false);
    expect(isValidGeoMapLngLat({ longitude: 44.5152, latitude: Number.POSITIVE_INFINITY })).toBe(
      false,
    );
  });

  it('rejects out-of-range and reversed coordinates', () => {
    expect(isValidGeoMapLngLat({ longitude: 181, latitude: 40.1872 })).toBe(false);
    expect(isValidGeoMapLngLat({ longitude: 40.1872, latitude: 144.5152 })).toBe(false);
  });
});
