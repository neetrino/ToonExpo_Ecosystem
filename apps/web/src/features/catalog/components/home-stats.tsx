import { getLocale, getTranslations } from 'next-intl/server';

import { AnimatedCounter } from '@/shared/ui/motion/animated-counter';
import { cn } from '@/shared/ui/cn';

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
export const HomeStats = async () => {
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
            'shadow-[0_20px_25px_-5px_rgb(25_38_67/0.1),0_8px_10px_-6px_rgb(25_38_67/0.1)]',
          )}
        >
          <div className="grid w-full grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-5 md:gap-x-4">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="min-w-0 px-0.5 text-center last:col-span-2 sm:last:col-span-1"
              >                <p
                  className={cn(
                    'text-balance text-[10px] font-bold uppercase leading-snug',
                    'tracking-[0.08em] text-canvas/50',
                  )}
                >
                  {stat.label}
                </p>
                <p
                  className={cn(
                    'mt-1.5 font-brand font-bold tracking-tight text-canvas tabular-nums',
                    'text-[clamp(1rem,0.75rem+2.2vw,1.75rem)] leading-none',
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
                    'mt-1 text-balance text-xs font-medium leading-4',
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
