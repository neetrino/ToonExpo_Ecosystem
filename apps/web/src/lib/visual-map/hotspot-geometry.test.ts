import { describe, expect, it } from 'vitest';

import { computeHotspotPercent } from './hotspot-geometry';

describe('computeHotspotPercent', () => {
  const rect = { left: 100, top: 50, width: 400, height: 200 };

  it('returns center percentages for center click', () => {
    expect(computeHotspotPercent(rect, 300, 150)).toEqual({ x: 50, y: 50 });
  });

  it('returns top-left for corner click', () => {
    expect(computeHotspotPercent(rect, 100, 50)).toEqual({ x: 0, y: 0 });
  });

  it('clamps coordinates to 0–100', () => {
    expect(computeHotspotPercent(rect, 50, 10)).toEqual({ x: 0, y: 0 });
    expect(computeHotspotPercent(rect, 600, 300)).toEqual({ x: 100, y: 100 });
  });

  it('handles zero-size rect safely', () => {
    expect(computeHotspotPercent({ left: 0, top: 0, width: 0, height: 0 }, 10, 10)).toEqual({
      x: 0,
      y: 0,
    });
  });
});
