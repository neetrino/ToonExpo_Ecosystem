import { describe, expect, it } from "vitest";

import { calculateWeightedOverallScore } from "./overall-score.util.js";

describe("calculateWeightedOverallScore", () => {
  it("returns null when no scored categories exist", () => {
    expect(calculateWeightedOverallScore([])).toBeNull();
    expect(
      calculateWeightedOverallScore([{ score: null as unknown as number, weight: 2 }]),
    ).toBeNull();
  });

  it("uses default weight 1 when category weight is null", () => {
    expect(
      calculateWeightedOverallScore([
        { score: 80, weight: null },
        { score: 60, weight: null },
      ]),
    ).toBe(70);
  });

  it("computes weighted average with explicit weights", () => {
    expect(
      calculateWeightedOverallScore([
        { score: 100, weight: 2 },
        { score: 50, weight: 1 },
      ]),
    ).toBe(83);
  });

  it("rounds to nearest integer", () => {
    expect(
      calculateWeightedOverallScore([
        { score: 70, weight: 1 },
        { score: 71, weight: 1 },
      ]),
    ).toBe(71);
  });
});
