import { describe, expect, it } from "vitest";
import { ReadinessScoreStatus } from "@toonexpo/db";

import {
  READINESS_IN_PROGRESS_MAX,
  READINESS_IN_PROGRESS_MIN,
  READINESS_NEEDS_IMPROVEMENT_MAX,
  READINESS_READY_MIN,
} from "../readiness.constants.js";
import {
  assertValidReadinessScore,
  deriveStatusFromScore,
} from "./score-status.util.js";

describe("deriveStatusFromScore", () => {
  it("maps 0 through needs_improvement max to needs_improvement", () => {
    expect(deriveStatusFromScore(0)).toBe(ReadinessScoreStatus.needs_improvement);
    expect(deriveStatusFromScore(READINESS_NEEDS_IMPROVEMENT_MAX)).toBe(
      ReadinessScoreStatus.needs_improvement,
    );
  });

  it("maps in-progress band to in_progress", () => {
    expect(deriveStatusFromScore(READINESS_IN_PROGRESS_MIN)).toBe(
      ReadinessScoreStatus.in_progress,
    );
    expect(deriveStatusFromScore(READINESS_IN_PROGRESS_MAX)).toBe(
      ReadinessScoreStatus.in_progress,
    );
  });

  it("maps ready band to ready", () => {
    expect(deriveStatusFromScore(READINESS_READY_MIN)).toBe(ReadinessScoreStatus.ready);
    expect(deriveStatusFromScore(100)).toBe(ReadinessScoreStatus.ready);
  });

  it("rejects out-of-range scores", () => {
    expect(() => assertValidReadinessScore(-1)).toThrow(RangeError);
    expect(() => assertValidReadinessScore(101)).toThrow(RangeError);
  });
});
