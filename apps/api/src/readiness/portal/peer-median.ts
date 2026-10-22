type ScoredCompany = {
  builderCompanyId: string;
  overallScore: number | null;
};

/**
 * Median of the latest overall score per builder company.
 * Rows must already be ordered newest first.
 */
export const medianOfLatestScores = (rows: readonly ScoredCompany[]): number | null => {
  const latest = new Map<string, number>();

  for (const row of rows) {
    if (row.overallScore === null || latest.has(row.builderCompanyId)) {
      continue;
    }
    latest.set(row.builderCompanyId, row.overallScore);
  }

  const scores = [...latest.values()].sort((left, right) => left - right);
  if (scores.length === 0) {
    return null;
  }

  const mid = Math.floor(scores.length / 2);
  if (scores.length % 2 === 1) {
    return scores[mid] ?? null;
  }

  const left = scores[mid - 1];
  const right = scores[mid];
  if (left === undefined || right === undefined) {
    return null;
  }

  return Math.round((left + right) / 2);
};
