import { describe, expect, it } from 'vitest';

import {
  computeFootprintCenter,
  resolveSourceOsmId,
} from '@/features/geo-map/utils/building-identification';

describe('resolveSourceOsmId', () => {
  it('reads osm_id from properties', () => {
    expect(resolveSourceOsmId({ osm_id: 582962758 })).toBe('582962758');
  });

  it('strips OSM type prefixes', () => {
    expect(resolveSourceOsmId({ '@id': 'way/123' })).toBe('123');
  });

  it('returns null when missing', () => {
    expect(resolveSourceOsmId({})).toBeNull();
    expect(resolveSourceOsmId(null)).toBeNull();
  });
});

describe('computeFootprintCenter', () => {
  it('computes a polygon centroid', () => {
    const [lng, lat] = computeFootprintCenter({
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [4, 0],
          [4, 4],
          [0, 4],
          [0, 0],
        ],
      ],
    });
    expect(lng).toBeCloseTo(2, 5);
    expect(lat).toBeCloseTo(2, 5);
  });
});
