const MS_PER_DAY = 86_400_000;

type RelativeUpdatedLabels = {
  unknown: string;
  today: string;
  daysAgo: (count: number) => string;
};

/**
 * Formats canvas `updatedAt` for mapping building cards (e.g. "2 days ago").
 */
export const formatMappingRelativeUpdated = (
  updatedAt: string | null,
  labels: RelativeUpdatedLabels,
): string => {
  if (!updatedAt) {
    return labels.unknown;
  }

  const updatedMs = new Date(updatedAt).getTime();
  if (!Number.isFinite(updatedMs)) {
    return labels.unknown;
  }

  const dayDiff = Math.floor((Date.now() - updatedMs) / MS_PER_DAY);
  if (dayDiff <= 0) {
    return labels.today;
  }

  return labels.daysAgo(dayDiff);
};
