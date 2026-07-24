'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { ANALYTICS_RANGE_PRESETS, type AnalyticsRangePreset } from '@/features/analytics/constants';
import { resolveAnalyticsDateRange } from '@/features/analytics/utils/resolve-analytics-date-range';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type AnalyticsDateRangeFilterProps = {
  presetParam?: string;
};

/** Equal segment width so the thumb can slide like ViewModeToggle. */
const SEGMENT_MIN_WIDTH_CLASS = 'min-w-[8.25rem]';

const PRESET_THUMB_TRANSLATE: Record<AnalyticsRangePreset, string> = {
  today: 'translate-x-0',
  last7Days: 'translate-x-[calc(100%+0.125rem)]',
  last30Days: 'translate-x-[calc(200%+0.25rem)]',
};

const formatRangeDate = (iso: string, locale: string): string =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));

/**
 * Preset switcher (today / 7 / 30 days) synced to URL search params.
 */
export const AnalyticsDateRangeFilter = ({
  presetParam = 'preset',
}: AnalyticsDateRangeFilterProps) => {
  const t = useTranslations('Analytics.dateRange');
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
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {t('label')}
        </span>
        <div
          role="group"
          aria-label={t('label')}
          className="relative inline-flex h-9 items-center gap-0.5 rounded-pill bg-surface-elevated p-0.5 ring-1 ring-border"
        >
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute top-0.5 left-0.5 h-8 rounded-pill',
              SEGMENT_MIN_WIDTH_CLASS,
              'bg-brand-secondary shadow-xs',
              'transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-premium)]',
              'motion-reduce:transition-none',
              PRESET_THUMB_TRANSLATE[range.preset],
            )}
          />
          {ANALYTICS_RANGE_PRESETS.map((preset) => {
            const active = range.preset === preset;
            return (
              <button
                key={preset}
                type="button"
                aria-pressed={active}
                className={cn(
                  'relative z-10 inline-flex h-8 items-center justify-center rounded-pill px-3',
                  SEGMENT_MIN_WIDTH_CLASS,
                  'text-sm font-medium whitespace-nowrap',
                  'transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-premium)]',
                  'motion-reduce:transition-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30',
                  active ? 'text-on-dark' : 'text-ink-muted hover:text-ink',
                )}
                onClick={() => {
                  setPreset(preset);
                }}
              >
                {t(preset)}
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-sm text-ink-secondary">
        {t('activeRange', {
          from: formatRangeDate(range.from, locale),
          to: formatRangeDate(range.to, locale),
        })}
      </p>
    </div>
  );
};
