import { describe, expect, it } from 'vitest';

import { computeOverallScore, isWeakReadinessStatus, statusFromScore } from './score';

describe('statusFromScore', () => {
  it('maps 0–39 to NEEDS_IMPROVEMENT', () => {
    expect(statusFromScore(0)).toBe('NEEDS_IMPROVEMENT');
    expect(statusFromScore(39)).toBe('NEEDS_IMPROVEMENT');
  });

  it('maps 40–69 to IN_PROGRESS', () => {
    expect(statusFromScore(40)).toBe('IN_PROGRESS');
    expect(statusFromScore(69)).toBe('IN_PROGRESS');
  });

  it('maps 70–100 to READY', () => {
    expect(statusFromScore(70)).toBe('READY');
    expect(statusFromScore(100)).toBe('READY');
  });
});

describe('computeOverallScore', () => {
  it('returns null for empty input', () => {
    expect(computeOverallScore([])).toBeNull();
  });

  it('computes a simple average when weights are absent', () => {
    expect(
      computeOverallScore([
        { score: 30, weight: null },
        { score: 70, weight: null },
      ]),
    ).toBe(50);
  });

  it('computes a weighted average when weights are present', () => {
    expect(
      computeOverallScore([
        { score: 100, weight: 1 },
        { score: 0, weight: 3 },
      ]),
    ).toBe(25);
  });

  it('treats missing weight as 1 when any weight is set', () => {
    expect(
      computeOverallScore([
        { score: 100, weight: 2 },
        { score: 0, weight: null },
      ]),
    ).toBe(67);
  });
});

describe('isWeakReadinessStatus', () => {
  it('flags needs_improvement and in_progress as weak', () => {
    expect(isWeakReadinessStatus('NEEDS_IMPROVEMENT')).toBe(true);
    expect(isWeakReadinessStatus('IN_PROGRESS')).toBe(true);
    expect(isWeakReadinessStatus('READY')).toBe(false);
    expect(isWeakReadinessStatus('BLOCKED')).toBe(false);
    expect(isWeakReadinessStatus('NOT_STARTED')).toBe(false);
  });
});
