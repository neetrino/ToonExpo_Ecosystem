"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import {
  ANALYTICS_RANGE_PRESETS,
  type AnalyticsRangePreset,
} from "@/features/analytics/constants";
import { resolveAnalyticsDateRange } from "@/features/analytics/utils/resolve-analytics-date-range";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/shared/ui/cn";

type AnalyticsDateRangeFilterProps = {
  presetParam?: string;
};

const formatRangeDate = (iso: string, locale: string): string =>
  new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));

/**
 * Preset buttons (today / 7 / 30 days) synced to URL search params.
 */
export const AnalyticsDateRangeFilter = ({
  presetParam = "preset",
}: AnalyticsDateRangeFilterProps) => {
  const t = useTranslations("Analytics.dateRange");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const range = resolveAnalyticsDateRange(searchParams.get(presetParam));

  const setPreset = (preset: AnalyticsRangePreset) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(presetParam, preset);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {t("label")}
        </span>
        {ANALYTICS_RANGE_PRESETS.map((preset) => {
          const active = range.preset === preset;
          return (
            <button
              key={preset}
              type="button"
              className={cn(
                "rounded-pill px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-cta-dark text-on-dark"
                  : "border border-border-strong text-ink-secondary hover:bg-background",
              )}
              aria-pressed={active}
              onClick={() => {
                setPreset(preset);
              }}
            >
              {t(preset)}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-ink-secondary">
        {t("activeRange", {
          from: formatRangeDate(range.from, locale),
          to: formatRangeDate(range.to, locale),
        })}
      </p>
    </div>
  );
};
