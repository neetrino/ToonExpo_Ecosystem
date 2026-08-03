import { describe, expect, it } from 'vitest';

import { isCoordinateWithinBounds, type LngLatBounds } from '@/features/geo-map/utils/geo-bounds';

const bounds: LngLatBounds = { west: 44, south: 40, east: 45, north: 41 };

describe('isCoordinateWithinBounds', () => {
  it('returns true for a point inside the bounds', () => {
    expect(isCoordinateWithinBounds(44.5, 40.5, bounds, 0)).toBe(true);
  });

  it('returns false for a point outside the bounds with no padding', () => {
    expect(isCoordinateWithinBounds(46, 40.5, bounds, 0)).toBe(false);
  });

  it('returns true for a point just outside the bounds when padding covers it', () => {
    expect(isCoordinateWithinBounds(45.05, 40.5, bounds, 0.1)).toBe(true);
  });

  it('returns false for a point outside the bounds even with padding', () => {
    expect(isCoordinateWithinBounds(46, 40.5, bounds, 0.1)).toBe(false);
  });

  it('treats exact boundary coordinates as inside', () => {
    expect(isCoordinateWithinBounds(44, 40, bounds, 0)).toBe(true);
    expect(isCoordinateWithinBounds(45, 41, bounds, 0)).toBe(true);
  });
});
