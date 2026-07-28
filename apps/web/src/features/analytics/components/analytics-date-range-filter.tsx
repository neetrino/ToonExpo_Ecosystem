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
 * Full-width equal segments so the control stays inside the page on mobile.
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

  const setPreset = (preset: AnalyticsRangePreset): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(presetParam, preset);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-md border border-border bg-surface p-4">
      <div className="flex min-w-0 flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {t('label')}
        </span>
        <div
          role="group"
          aria-label={t('label')}
          className="relative flex w-full min-w-0 items-center gap-0.5 rounded-pill bg-surface-elevated p-0.5 ring-1 ring-border"
        >
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-0.5rem)/3)] rounded-pill',
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
                  'relative z-10 inline-flex h-8 min-w-0 flex-1 items-center justify-center rounded-pill px-1.5',
                  'text-center text-xs font-medium leading-tight sm:px-3 sm:text-sm',
                  'transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-premium)]',
                  'motion-reduce:transition-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30',
                  active ? 'text-on-dark' : 'text-ink-muted hover:text-ink',
                )}
                onClick={() => {
                  setPreset(preset);
                }}
              >
                <span className="truncate">{t(preset)}</span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="min-w-0 break-words text-sm text-ink-secondary">
        {t('activeRange', {
          from: formatRangeDate(range.from, locale),
          to: formatRangeDate(range.to, locale),
        })}
      </p>
    </div>
  );
};
