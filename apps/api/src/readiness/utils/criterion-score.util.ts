/**
 * Aggregate leaf KPI criterion points into a 0–100 category percent.
 */
export type CriterionPointsEntry = {
  maxPoints: number | null;
  value: number | null;
  /** Group headers and non-scored rows are excluded when true. */
  hasChildren?: boolean | undefined;
};

/**
 * Returns rounded percent or null when no scored leaf criteria exist.
 */
export const calculateCategoryScoreFromCriteria = (
  entries: readonly CriterionPointsEntry[],
): number | null => {
  let earned = 0;
  let max = 0;

  for (const entry of entries) {
    if (entry.hasChildren) {
      continue;
    }
    if (entry.maxPoints === null || entry.maxPoints <= 0) {
      continue;
    }
    if (entry.value === null) {
      continue;
    }
    const clamped = Math.max(0, Math.min(entry.maxPoints, entry.value));
    earned += clamped;
    max += entry.maxPoints;
  }

  if (max === 0) {
    return null;
  }

  return Math.round((earned / max) * 100);
};

/**
 * Group display percent from direct child leaf entries (for accordion subgroup headers).
 */
export const calculateGroupScorePercent = (
  childEntries: readonly CriterionPointsEntry[],
): number | null => calculateCategoryScoreFromCriteria(childEntries);
