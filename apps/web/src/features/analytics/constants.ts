/** Default analytics lookback when no preset or dates are provided. */
export const ANALYTICS_DEFAULT_RANGE_DAYS = 30;

export const ANALYTICS_RANGE_PRESETS = [
  "today",
  "last7Days",
  "last30Days",
] as const;

export type AnalyticsRangePreset = (typeof ANALYTICS_RANGE_PRESETS)[number];

export const ANALYTICS_DEFAULT_PRESET: AnalyticsRangePreset = "last30Days";

export const ANALYTICS_PRESET_DAYS: Record<
  Exclude<AnalyticsRangePreset, "today">,
  number
> = {
  last7Days: 7,
  last30Days: 30,
};

export const ANALYTICS_BAR_STEPS = 10;

export const BAR_FILL_COL_SPAN: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
};
