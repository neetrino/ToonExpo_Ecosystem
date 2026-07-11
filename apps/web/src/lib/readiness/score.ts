import {
  READINESS_IN_PROGRESS_MAX_SCORE,
  READINESS_NEEDS_IMPROVEMENT_MAX_SCORE,
  READINESS_SCORE_MAX,
  READINESS_SCORE_MIN,
} from '@toonexpo/contracts';
import type { ReadinessStatus } from '@toonexpo/domain';

export type CategoryScoreWeight = {
  score: number;
  weight: number | null;
};

/**
 * Maps numeric score to category status (docs 03).
 * `blocked` and `not_started` are set manually — this helper covers the numeric band only.
 */
export function statusFromScore(
  score: number,
): Exclude<ReadinessStatus, 'BLOCKED' | 'NOT_STARTED'> {
  if (score <= READINESS_NEEDS_IMPROVEMENT_MAX_SCORE) {
    return 'NEEDS_IMPROVEMENT';
  }
  if (score <= READINESS_IN_PROGRESS_MAX_SCORE) {
    return 'IN_PROGRESS';
  }
  return 'READY';
}

/**
 * Weighted average when any weight is set; otherwise simple average.
 * Scores outside 0–100 are clamped. Empty input → null.
 */
export function computeOverallScore(entries: readonly CategoryScoreWeight[]): number | null {
  const scored = entries.filter((entry) => Number.isFinite(entry.score));
  if (scored.length === 0) {
    return null;
  }

  const hasWeights = scored.some((entry) => entry.weight !== null && entry.weight > 0);
  if (!hasWeights) {
    const sum = scored.reduce((acc, entry) => acc + clampScore(entry.score), 0);
    return Math.round(sum / scored.length);
  }

  let weightedSum = 0;
  let totalWeight = 0;
  for (const entry of scored) {
    const weight = entry.weight !== null && entry.weight > 0 ? entry.weight : 1;
    weightedSum += clampScore(entry.score) * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    return null;
  }

  return Math.round(weightedSum / totalWeight);
}

function clampScore(score: number): number {
  return Math.min(READINESS_SCORE_MAX, Math.max(READINESS_SCORE_MIN, score));
}

/** Weak / in-progress categories qualify for provider help (docs 06). */
export function isWeakReadinessStatus(status: ReadinessStatus): boolean {
  return status === 'NEEDS_IMPROVEMENT' || status === 'IN_PROGRESS';
}
