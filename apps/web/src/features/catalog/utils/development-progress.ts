export type DevelopmentBadge = 'preSale' | 'selling' | 'underConstruction';

/**
 * Sold share from availability counts (0–100).
 */
export const computeSoldPercent = (project: {
  availability: { total: number; sold: number };
}): number => {
  const total = project.availability.total;
  if (total <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((project.availability.sold / total) * 100));
};

/**
 * Status badge heuristic from sold percentage.
 */
export const resolveBadge = (soldPercent: number): DevelopmentBadge => {
  if (soldPercent < 25) {
    return 'preSale';
  }
  if (soldPercent < 75) {
    return 'selling';
  }
  return 'underConstruction';
};
