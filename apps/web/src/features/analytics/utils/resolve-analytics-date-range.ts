import {
  ANALYTICS_DEFAULT_PRESET,
  ANALYTICS_PRESET_DAYS,
  ANALYTICS_RANGE_PRESETS,
  type AnalyticsRangePreset,
} from '@/features/analytics/constants';

const DAY_MS = 24 * 60 * 60 * 1000;

export type ResolvedAnalyticsDateRange = {
  preset: AnalyticsRangePreset;
  from: string;
  to: string;
};

const isAnalyticsRangePreset = (value: string | null): value is AnalyticsRangePreset =>
  value !== null && (ANALYTICS_RANGE_PRESETS as readonly string[]).includes(value);

const startOfLocalDay = (date: Date): Date => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

/**
 * Floors to local minute so repeated resolves in the same minute share ISO bounds.
 * Prevents React Query key thrash (`new Date()` every render → infinite refetch).
 */
export const startOfLocalMinute = (date: Date): Date => {
  const next = new Date(date);
  next.setSeconds(0, 0);
  return next;
};

/** Maps a preset to inclusive ISO from/to bounds for analytics API queries. */
export const resolveAnalyticsDateRangeFromPreset = (
  preset: AnalyticsRangePreset,
  now: Date = startOfLocalMinute(new Date()),
): { from: string; to: string } => {
  const to = now;

  if (preset === 'today') {
    return {
      from: startOfLocalDay(now).toISOString(),
      to: to.toISOString(),
    };
  }

  const days = ANALYTICS_PRESET_DAYS[preset];
  return {
    from: new Date(to.getTime() - days * DAY_MS).toISOString(),
    to: to.toISOString(),
  };
};

/** Reads preset from URL search params with a default 30-day window. */
export const resolveAnalyticsDateRange = (
  presetParam: string | null,
  now: Date = startOfLocalMinute(new Date()),
): ResolvedAnalyticsDateRange => {
  const preset = isAnalyticsRangePreset(presetParam) ? presetParam : ANALYTICS_DEFAULT_PRESET;

  return {
    preset,
    ...resolveAnalyticsDateRangeFromPreset(preset, now),
  };
};
