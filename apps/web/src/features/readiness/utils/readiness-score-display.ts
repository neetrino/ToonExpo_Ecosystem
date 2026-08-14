import { READINESS_SCORE_MAX } from '@/features/readiness/constants';

/**
 * Maps a 0–100 readiness score to a display percent.
 */
export const scorePercent = (score: number | null): number => {
  if (score === null) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((score / READINESS_SCORE_MAX) * 100)));
};
