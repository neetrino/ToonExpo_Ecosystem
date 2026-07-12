/** Rolling window for “recent” dashboard totals (docs: builder analytics time filters). */
export const ANALYTICS_LOOKBACK_DAYS = 30;

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** Start of the lookback window relative to `now` (defaults to current time). */
export function analyticsLookbackStart(now: Date = new Date()): Date {
  return new Date(now.getTime() - ANALYTICS_LOOKBACK_DAYS * MILLISECONDS_PER_DAY);
}
