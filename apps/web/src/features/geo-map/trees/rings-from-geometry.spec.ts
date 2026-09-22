import { describe, expect, it } from 'vitest';

import { pointFromGeometry, ringsFromGeometry } from '@/features/geo-map/trees/rings-from-geometry';

describe('ringsFromGeometry', () => {
  it('reads a polygon outer ring', () => {
    const rings = ringsFromGeometry({
      type: 'Polygon',
      coordinates: [
        [
          [44, 40],
          [45, 40],
          [45, 41],
          [44, 41],
          [44, 40],
        ],
      ],
    });
    expect(rings).toHaveLength(1);
    expect(rings[0]).toHaveLength(5);
  });

  it('reads a point used for park POI fallback', () => {
    expect(pointFromGeometry({ type: 'Point', coordinates: [44.51, 40.18] })).toEqual({
      longitude: 44.51,
      latitude: 40.18,
    });
  });
});
