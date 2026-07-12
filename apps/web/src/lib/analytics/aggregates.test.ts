import { describe, expect, it } from 'vitest';

import { mapGroupCounts, toPercentageShares } from './aggregates';

describe('mapGroupCounts', () => {
  it('fills missing keys with zero when keys are provided', () => {
    expect(
      mapGroupCounts([{ key: 'A', count: 3 }], ['A', 'B', 'C']),
    ).toEqual([
      { key: 'A', count: 3 },
      { key: 'B', count: 0 },
      { key: 'C', count: 0 },
    ]);
  });
});

describe('toPercentageShares', () => {
  it('returns zeros when total is empty', () => {
    expect(toPercentageShares([{ key: 'A', count: 0 }])).toEqual([
      { key: 'A', count: 0, percent: 0 },
    ]);
  });

  it('maps stage distribution percentages that sum to 100', () => {
    const shares = toPercentageShares([
      { key: 'NEW_REQUEST', count: 1 },
      { key: 'CONTACTED', count: 1 },
      { key: 'CONVERTED', count: 2 },
    ]);

    expect(shares).toHaveLength(3);
    expect(shares.reduce((sum, row) => sum + row.percent, 0)).toBe(100);
    expect(shares[2]?.percent).toBeGreaterThan(0);
  });
});
