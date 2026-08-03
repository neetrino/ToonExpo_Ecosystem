import { describe, expect, it } from 'vitest';

import { calculateCategoryScoreFromCriteria } from './criterion-score.util.js';

describe('calculateCategoryScoreFromCriteria', () => {
  it('returns null when no scored leaf criteria exist', () => {
    expect(
      calculateCategoryScoreFromCriteria([
        { maxPoints: null, value: null, hasChildren: true },
        { maxPoints: 25, value: null },
      ]),
    ).toBeNull();
  });

  it('computes percent from scored leaf points only', () => {
    expect(
      calculateCategoryScoreFromCriteria([
        { maxPoints: null, value: null, hasChildren: true },
        { maxPoints: 25, value: 15 },
        { maxPoints: 15, value: 10 },
        { maxPoints: 20, value: 12 },
        { maxPoints: 15, value: 15 },
        { maxPoints: 25, value: 25 },
        { maxPoints: 60, value: null },
      ]),
    ).toBe(77);
  });
});
