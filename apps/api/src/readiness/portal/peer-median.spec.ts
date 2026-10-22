import { describe, expect, it } from 'vitest';

import { medianOfLatestScores } from './peer-median.js';

describe('medianOfLatestScores', () => {
  it('uses the newest score per company and returns the median', () => {
    const median = medianOfLatestScores([
      { builderCompanyId: 'a', overallScore: 80 },
      { builderCompanyId: 'a', overallScore: 10 },
      { builderCompanyId: 'b', overallScore: 40 },
      { builderCompanyId: 'c', overallScore: 20 },
    ]);

    expect(median).toBe(40);
  });

  it('returns null when no scores exist', () => {
    expect(medianOfLatestScores([])).toBeNull();
  });
});
