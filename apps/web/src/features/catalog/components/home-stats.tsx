import type { ProjectListItem } from '@toonexpo/contracts';
import { getLocale, getTranslations } from 'next-intl/server';

import {
  AnimatedCounter,
  type AnimatedCounterFormatStyle,
} from '@/shared/ui/motion/animated-counter';
import { cn } from '@/shared/ui/cn';

type HomeStatsProps = {
  projects: ProjectListItem[];
  /** Kept for call-site compatibility; market pulse no longer surfaces builder count. */
  builderCount?: number | undefined;
  projectTotal?: number | undefined;
};

type StatTone = 'positive' | 'caution';

type MarketStat = {
  id: string;
  label: string;
  hint: string;
  tone: StatTone;
  display: string;
  numericValue?: number;
  formatStyle?: AnimatedCounterFormatStyle;
};

/** Illustrative market metrics until a dedicated pulse API exists. */
const MARKET_AVG_SQFT_USD = 1420;
const MARKET_MORTGAGE_RATE = 5.92;
const MARKET_MEDIAN_DAYS = 42;

/**
 * Brand-deep market pulse bar under the hero — Figma node `81:152`.
 * Renders as its own section on the canvas (not overlaid on the hero photo).
 */
export const HomeStats = async ({ projects }: HomeStatsProps) => {
  const t = await getTranslations('HomePage.stats');
  const locale = await getLocale();
  const listingCount = projects.reduce((sum, project) => sum + project.availability.total, 0);
  const activeListings = listingCount > 0 ? listingCount : 14_802;

  const stats: MarketStat[] = [
    {
      id: 'avgSqft',
      label: t('avgSqft'),
      hint: t('avgSqftHint'),
      tone: 'positive',
      display: String(MARKET_AVG_SQFT_USD),
      numericValue: MARKET_AVG_SQFT_USD,
      formatStyle: 'currencyUsd',
    },
    {
      id: 'listings',
      label: t('activeListings'),
      hint: t('activeListingsHint'),
      tone: 'positive',
      display: String(activeListings),
      numericValue: activeListings,
      formatStyle: 'integer',
    },
    {
      id: 'mortgage',
      label: t('mortgageRate'),
      hint: t('mortgageRateHint'),
      tone: 'caution',
      display: `${MARKET_MORTGAGE_RATE.toFixed(2)}%`,
    },
    {
      id: 'days',
      label: t('medianDays'),
      hint: t('medianDaysHint'),
      tone: 'positive',
      display: String(MARKET_MEDIAN_DAYS),
      numericValue: MARKET_MEDIAN_DAYS,
      formatStyle: 'integer',
    },
  ];

  return (
    <section aria-label={t('badge')} className="bg-canvas py-8 md:py-10">
      <div className="page-container">
        <div
          className={cn(
            'rounded-[20px] bg-brand-deep p-8 text-canvas',
            'shadow-[0_20px_25px_-5px_rgb(9_43_68/0.1),0_8px_10px_-6px_rgb(9_43_68/0.1)]',
          )}
        >
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id} className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-canvas/50">
                  {stat.label}
                </p>
                <p className="mt-1.5 font-brand text-[30px] font-bold leading-9 tracking-tight text-canvas">
                  {stat.numericValue != null && stat.formatStyle ? (
                    <AnimatedCounter
                      value={stat.numericValue}
                      formatStyle={stat.formatStyle}
                      locale={locale}
                    />
                  ) : (
                    stat.display
                  )}
                </p>
                <p
                  className={cn(
                    'mt-1 text-xs font-medium leading-4',
                    stat.tone === 'positive' ? 'text-stat-positive' : 'text-stat-caution',
                  )}
                >
                  {stat.hint}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
