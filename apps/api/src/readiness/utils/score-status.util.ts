import { ReadinessScoreStatus } from "@toonexpo/db";

import {
  READINESS_IN_PROGRESS_MAX,
  READINESS_IN_PROGRESS_MIN,
  READINESS_NEEDS_IMPROVEMENT_MAX,
  READINESS_READY_MIN,
  READINESS_SCORE_MAX,
  READINESS_SCORE_MIN,
} from "../readiness.constants.js";

/**
 * Validates that a score is within the documented v1 range.
 */
export const assertValidReadinessScore = (score: number): void => {
  if (score < READINESS_SCORE_MIN || score > READINESS_SCORE_MAX) {
    throw new RangeError(
      `Score must be between ${READINESS_SCORE_MIN} and ${READINESS_SCORE_MAX}`,
    );
  }
};

/**
 * Maps a numeric score to the default category status per product spec.
 * `blocked` is never derived automatically.
 */
export const deriveStatusFromScore = (score: number): ReadinessScoreStatus => {
  assertValidReadinessScore(score);

  if (score <= READINESS_NEEDS_IMPROVEMENT_MAX) {
    return ReadinessScoreStatus.needs_improvement;
  }

  if (score >= READINESS_IN_PROGRESS_MIN && score <= READINESS_IN_PROGRESS_MAX) {
    return ReadinessScoreStatus.in_progress;
  }

  if (score >= READINESS_READY_MIN) {
    return ReadinessScoreStatus.ready;
  }

  return ReadinessScoreStatus.in_progress;
};
