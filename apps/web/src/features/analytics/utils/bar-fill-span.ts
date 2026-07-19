import {
  ANALYTICS_BAR_STEPS,
  BAR_FILL_COL_SPAN,
} from "@/features/analytics/constants";

/** Converts a value/max ratio into a fixed 10-step Tailwind col-span class. */
export const toBarFillStep = (value: number, max: number): number => {
  if (max <= 0 || value <= 0) {
    return 0;
  }

  const percent = (value / max) * 100;
  return Math.min(
    ANALYTICS_BAR_STEPS,
    Math.max(1, Math.round(percent / (100 / ANALYTICS_BAR_STEPS))),
  );
};

export const barFillColSpanClass = (value: number, max: number): string | null => {
  const step = toBarFillStep(value, max);
  return step > 0 ? (BAR_FILL_COL_SPAN[step] ?? null) : null;
};
