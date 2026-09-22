import { describe, expect, it } from 'vitest';

import { linesFromGeometry } from '@/features/geo-map/traffic/lines-from-geometry';

describe('linesFromGeometry', () => {
  it('reads a LineString', () => {
    const lines = linesFromGeometry({
      type: 'LineString',
      coordinates: [
        [44.51, 40.18],
        [44.52, 40.18],
      ],
    });
    expect(lines).toHaveLength(1);
    expect(lines[0]).toHaveLength(2);
  });

  it('reads a MultiLineString', () => {
    const lines = linesFromGeometry({
      type: 'MultiLineString',
      coordinates: [
        [
          [44.51, 40.18],
          [44.52, 40.18],
        ],
        [
          [44.51, 40.19],
          [44.52, 40.19],
        ],
      ],
    });
    expect(lines).toHaveLength(2);
  });

  it('ignores polygons', () => {
    expect(
      linesFromGeometry({
        type: 'Polygon',
        coordinates: [
          [
            [44, 40],
            [45, 40],
            [45, 41],
            [44, 40],
          ],
        ],
      }),
    ).toEqual([]);
  });
});
