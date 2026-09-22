import { describe, expect, it } from 'vitest';

import { roundBuildingGeometry } from '@/features/geo-map/utils/round-building-geometry';

const box = [
  [44.51, 40.18],
  [44.5112, 40.18],
  [44.5112, 40.1811],
  [44.51, 40.1811],
  [44.51, 40.18],
];

describe('roundBuildingGeometry', () => {
  it('rounds a polygon outer ring', () => {
    const rounded = roundBuildingGeometry({ type: 'Polygon', coordinates: [box] });
    expect(rounded?.type).toBe('Polygon');
    expect(
      rounded && rounded.type === 'Polygon' ? rounded.coordinates[0]?.length : 0,
    ).toBeGreaterThan(box.length);
  });
});
