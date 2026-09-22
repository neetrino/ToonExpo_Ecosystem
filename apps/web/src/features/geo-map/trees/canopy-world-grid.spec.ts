import { describe, expect, it } from 'vitest';

import { canopyCellPoint, snapToCanopyGrid } from '@/features/geo-map/trees/canopy-world-grid';

describe('canopy-world-grid', () => {
  it('returns the same lng/lat for the same cell at any zoom', () => {
    const first = canopyCellPoint(120_000, 80_000, 8);
    const second = canopyCellPoint(120_000, 80_000, 8);
    expect(first).toEqual(second);
  });

  it('snaps nearby coordinates to the same park cell', () => {
    const a = snapToCanopyGrid({ longitude: 44.5152, latitude: 40.1872 }, 8);
    const b = snapToCanopyGrid({ longitude: 44.51521, latitude: 40.18722 }, 8);
    expect(a).toEqual(b);
  });
});
