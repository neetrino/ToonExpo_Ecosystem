import type { AnalyticsTrendMetric } from "@toonexpo/contracts";

import type { ResolvedAnalyticsDateRange } from "../analytics.types.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const PERCENT_DECIMALS = 1;

/** Equal-length window immediately before `range.from`. */
export const previousAnalyticsDateRange = (
  range: ResolvedAnalyticsDateRange,
): ResolvedAnalyticsDateRange => {
  const durationMs = Math.max(range.to.getTime() - range.from.getTime(), DAY_MS);
  const to = new Date(range.from.getTime());
  const from = new Date(to.getTime() - durationMs);

  return {
    from,
    to,
    fromIso: from.toISOString(),
    toIso: to.toISOString(),
  };
};

/** Percent change of `current` vs `baseline` (one decimal). */
export const percentChange = (
  current: number,
  baseline: number,
): number | null => {
  if (baseline === 0) {
    return current === 0 ? 0 : null;
  }

  const raw = ((current - baseline) / baseline) * 100;
  const factor = 10 ** PERCENT_DECIMALS;
  return Math.round(raw * factor) / factor;
};

export const toTrendMetric = (
  value: number,
  baseline: number,
): AnalyticsTrendMetric => ({
  value,
  changePercent: percentChange(value, baseline),
});

/** UTC calendar day key `YYYY-MM-DD`. */
export const toUtcDayKey = (date: Date): string => date.toISOString().slice(0, 10);

/** Inclusive list of UTC day keys from range.from through range.to. */
export const enumerateUtcDayKeys = (range: ResolvedAnalyticsDateRange): string[] => {
  const keys: string[] = [];
  const cursor = new Date(
    Date.UTC(
      range.from.getUTCFullYear(),
      range.from.getUTCMonth(),
      range.from.getUTCDate(),
    ),
  );
  const end = new Date(
    Date.UTC(
      range.to.getUTCFullYear(),
      range.to.getUTCMonth(),
      range.to.getUTCDate(),
    ),
  );

  while (cursor.getTime() <= end.getTime()) {
    keys.push(toUtcDayKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return keys;
};

export const countByUtcDay = (dates: Date[]): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const date of dates) {
    const key = toUtcDayKey(date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
};
