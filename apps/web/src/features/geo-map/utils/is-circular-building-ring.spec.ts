import { describe, expect, it } from 'vitest';

import { isCircularBuildingRing } from '@/features/geo-map/utils/is-circular-building-ring';
import { resampleCircularBuildingRing } from '@/features/geo-map/utils/resample-circular-building-ring';

const octagon = Array.from({ length: 8 }, (_, index) => {
  const angle = (index / 8) * Math.PI * 2;
  return [44.51 + Math.cos(angle) * 0.0004, 40.18 + Math.sin(angle) * 0.0004];
});
octagon.push(octagon[0] ?? [44.51, 40.18]);

const box = [
  [44.51, 40.18],
  [44.512, 40.18],
  [44.512, 40.182],
  [44.51, 40.182],
  [44.51, 40.18],
];

describe('circular OSM rings', () => {
  it('treats a regular octagon as a circle', () => {
    expect(isCircularBuildingRing(octagon)).toBe(true);
  });

  it('does not treat a rectangle as a circle', () => {
    expect(isCircularBuildingRing(box)).toBe(false);
  });

  it('treats a dense regular ring as a circle', () => {
    const ring = Array.from({ length: 24 }, (_, index) => {
      const angle = (index / 24) * Math.PI * 2;
      return [44.51 + Math.cos(angle) * 0.0004, 40.18 + Math.sin(angle) * 0.0004];
    });
    ring.push(ring[0] ?? [44.51, 40.18]);
    expect(isCircularBuildingRing(ring)).toBe(true);
  });

  it('resamples a faceted circle into a smooth ring', () => {
    const smooth = resampleCircularBuildingRing(octagon, 48, 1);
    expect(smooth.length).toBe(49);
    expect(smooth[0]).toEqual(smooth[smooth.length - 1]);
  });

  it('pads the circumradius so the original facets sit inside', () => {
    const tight = resampleCircularBuildingRing(octagon, 48, 1);
    const padded = resampleCircularBuildingRing(octagon, 48, 1.03);
    const firstTight = tight[0];
    const firstPadded = padded[0];
    if (!firstTight || !firstPadded) {
      throw new Error('expected resampled rings');
    }
    const radiusOf = (point: number[]): number =>
      Math.hypot((point[0] ?? 0) - 44.51, (point[1] ?? 0) - 40.18);
    expect(radiusOf(firstPadded)).toBeGreaterThan(radiusOf(firstTight));
  });
});
