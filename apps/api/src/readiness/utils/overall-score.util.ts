import { READINESS_DEFAULT_CATEGORY_WEIGHT } from "../readiness.constants.js";

type WeightedScoreInput = {
  score: number;
  weight: number | null;
};

/**
 * Computes weighted average of scored categories. Returns null when no scores exist.
 */
export const calculateWeightedOverallScore = (
  entries: WeightedScoreInput[],
): number | null => {
  const scored = entries.filter((entry) => entry.score !== null && entry.score !== undefined);
  if (scored.length === 0) {
    return null;
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const entry of scored) {
    const weight = entry.weight ?? READINESS_DEFAULT_CATEGORY_WEIGHT;
    weightedSum += entry.score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    return null;
  }

  return Math.round(weightedSum / totalWeight);
};
