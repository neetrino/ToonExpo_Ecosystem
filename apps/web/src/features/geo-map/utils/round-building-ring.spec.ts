import { describe, expect, it } from 'vitest';

import { roundBuildingRing } from '@/features/geo-map/utils/round-building-ring';

const box: readonly (readonly number[])[] = [
  [44.51, 40.18],
  [44.5112, 40.18],
  [44.5112, 40.1811],
  [44.51, 40.1811],
  [44.51, 40.18],
];

describe('roundBuildingRing', () => {
  it('adds corner vertices to a rectangular footprint', () => {
    const rounded = roundBuildingRing(box, 5, 3);
    expect(rounded.length).toBeGreaterThan(box.length);
    expect(rounded[0]).toEqual(rounded[rounded.length - 1]);
  });

  it('keeps a detailed ring unchanged so sync stays cheap', () => {
    const detailed = Array.from({ length: 60 }, (_, index) => [44.51 + index * 0.00001, 40.18]);
    detailed.push(detailed[0] ?? [44.51, 40.18]);
    expect(roundBuildingRing(detailed)).toHaveLength(detailed.length);
  });
});
