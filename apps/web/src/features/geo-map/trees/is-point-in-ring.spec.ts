import { describe, expect, it } from 'vitest';

import { isPointInRing } from '@/features/geo-map/trees/is-point-in-ring';

const square: readonly (readonly [number, number])[] = [
  [44, 40],
  [45, 40],
  [45, 41],
  [44, 41],
  [44, 40],
];

describe('isPointInRing', () => {
  it('returns true for a point inside the ring', () => {
    expect(isPointInRing({ longitude: 44.5, latitude: 40.5 }, square)).toBe(true);
  });

  it('returns false for a point outside the ring', () => {
    expect(isPointInRing({ longitude: 46, latitude: 40.5 }, square)).toBe(false);
  });
});
