import { getLocale, getTranslations } from 'next-intl/server';

import { AnimatedCounter } from '@/shared/ui/motion/animated-counter';
import { cn } from '@/shared/ui/cn';

type HomeStatsProps = {
  /** Kept for call-site compatibility; pulse uses fixed showcase metrics. */
  projects?: unknown;
  builderCount?: number | undefined;
  projectTotal?: number | undefined;
};

type StatTone = 'positive' | 'caution';

type MarketStat = {
  id: string;
  label: string;
  hint: string;
  tone: StatTone;
  numericValue: number;
};

const STAT_PROJECTS = 250;
const STAT_APARTMENTS = 3_500;
const STAT_MARKET_VALUE_MLN = 30_450_000;
const STAT_PARTICIPANTS = 20_000_000;
const STAT_AVG_MORTGAGE_PAYMENT = 15_000_000;

/**
 * Brand-deep market pulse bar under the hero — Figma node `81:152`.
 * Renders as its own section on the canvas (not overlaid on the hero photo).
 */
export const HomeStats = async (_props: HomeStatsProps) => {
  const t = await getTranslations('HomePage.stats');
  const locale = await getLocale();

  const stats: MarketStat[] = [
    {
      id: 'projects',
      label: t('projectCount'),
      hint: t('projectCountHint'),
      tone: 'positive',
      numericValue: STAT_PROJECTS,
    },
    {
      id: 'apartments',
      label: t('apartmentCount'),
      hint: t('apartmentCountHint'),
      tone: 'positive',
      numericValue: STAT_APARTMENTS,
    },
    {
      id: 'marketValue',
      label: t('marketValue'),
      hint: t('marketValueHint'),
      tone: 'positive',
      numericValue: STAT_MARKET_VALUE_MLN,
    },
    {
      id: 'participants',
      label: t('participantCount'),
      hint: t('participantCountHint'),
      tone: 'positive',
      numericValue: STAT_PARTICIPANTS,
    },
    {
      id: 'mortgagePayment',
      label: t('avgMortgagePayment'),
      hint: t('avgMortgagePaymentHint'),
      tone: 'caution',
      numericValue: STAT_AVG_MORTGAGE_PAYMENT,
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
          <div className="-translate-x-[10px] grid w-full grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-5">
            {stats.map((stat) => (
              <div key={stat.id} className="min-w-0 text-center">
                <p className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.08em] text-canvas/50">
                  {stat.label}
                </p>
                <p
                  className={cn(
                    'mt-1.5 whitespace-nowrap font-brand font-bold tracking-tight text-canvas',
                    'text-[clamp(1.125rem,0.85rem+2.4vw,1.75rem)] leading-none',
                  )}
                >
                  <AnimatedCounter
                    value={stat.numericValue}
                    formatStyle="integer"
                    locale={locale}
                  />
                </p>
                <p
                  className={cn(
                    'mt-1 whitespace-nowrap text-xs font-medium leading-4',
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
