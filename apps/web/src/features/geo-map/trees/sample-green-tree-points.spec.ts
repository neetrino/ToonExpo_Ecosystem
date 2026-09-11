import { describe, expect, it } from 'vitest';

import { sampleGreenTreePoints } from '@/features/geo-map/trees/sample-green-tree-points';

const park: readonly (readonly [number, number])[] = [
  [44.51, 40.18],
  [44.52, 40.18],
  [44.52, 40.19],
  [44.51, 40.19],
  [44.51, 40.18],
];

const clip = { west: 44.505, south: 40.175, east: 44.525, north: 40.195 };

describe('sampleGreenTreePoints', () => {
  it('places multiple points inside a clipped park ring', () => {
    const points = sampleGreenTreePoints([park], clip, 20);
    expect(points.length).toBeGreaterThan(3);
    expect(
      points.every((point) => point.longitude >= clip.west && point.longitude <= clip.east),
    ).toBe(true);
  });

  it('returns nothing when the clip misses the ring', () => {
    const points = sampleGreenTreePoints([park], {
      west: 45,
      south: 41,
      east: 46,
      north: 42,
    });
    expect(points).toEqual([]);
  });

  it('is deterministic for the same ring and clip', () => {
    expect(sampleGreenTreePoints([park], clip, 20)).toEqual(
      sampleGreenTreePoints([park], clip, 20),
    );
  });

  it('keeps the same trees in an overlapping smaller window', () => {
    const wide = sampleGreenTreePoints([park], clip, 20);
    const inner = {
      west: 44.512,
      south: 40.182,
      east: 44.518,
      north: 40.188,
    };
    const narrow = sampleGreenTreePoints([park], inner, 20);
    const key = (point: { longitude: number; latitude: number }) =>
      `${point.longitude.toFixed(5)}:${point.latitude.toFixed(5)}`;
    const wideKeys = new Set(wide.map(key));
    expect(narrow.length).toBeGreaterThan(0);
    expect(narrow.every((point) => wideKeys.has(key(point)))).toBe(true);
  });
});
