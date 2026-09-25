import { getLocale, getTranslations } from 'next-intl/server';

import { AnimatedCounter } from '@/shared/ui/motion/animated-counter';
import { cn } from '@/shared/ui/cn';

type MarketStat = {
  id: string;
  label: string;
  hint: string;
  numericValue: number;
};

const STAT_PARTICIPANTS = 370;
const STAT_INTERNATIONAL_PARTICIPANTS = 30;
const STAT_VISITORS = 140_000;
const STAT_SOLD_PROPERTIES = 9_500;

/**
 * Brand-deep market pulse bar under the hero — Figma node `81:152`.
 * Renders as its own section on the canvas (not overlaid on the hero photo).
 */
export const HomeStats = async () => {
  const t = await getTranslations('HomePage.stats');
  const locale = await getLocale();

  const stats: MarketStat[] = [
    {
      id: 'participants',
      label: t('participantCount'),
      hint: '',
      numericValue: STAT_PARTICIPANTS,
    },
    {
      id: 'internationalParticipants',
      label: t('internationalParticipantCount'),
      hint: '',
      numericValue: STAT_INTERNATIONAL_PARTICIPANTS,
    },
    {
      id: 'visitors',
      label: t('visitorCount'),
      hint: '',
      numericValue: STAT_VISITORS,
    },
    {
      id: 'soldProperties',
      label: t('soldPropertyCount'),
      hint: t('soldPropertyCountHint'),
      numericValue: STAT_SOLD_PROPERTIES,
    },
  ];

  return (
    <section aria-label={t('badge')} className="bg-canvas py-8 md:py-10">
      <div className="page-container">
        <div
          className={cn(
            'rounded-[20px] bg-brand-deep px-8 py-5 text-canvas',
            'shadow-[0_20px_25px_-5px_rgb(25_38_67/0.1),0_8px_10px_-6px_rgb(25_38_67/0.1)]',
          )}
        >
          <div className="grid w-full grid-cols-2 gap-x-4 md:grid-cols-4 md:gap-x-5 lg:gap-x-4">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="row-span-3 grid min-w-0 grid-rows-subgrid justify-items-center px-0.5 py-3 text-center"
              >
                <p
                  className={cn(
                    'self-end max-w-full min-w-0 text-balance text-[10px] font-bold uppercase',
                    'leading-snug tracking-[0.08em] -me-[0.08em] text-canvas/50',
                    'lg:whitespace-nowrap lg:leading-none lg:tracking-[0.04em] lg:-me-[0.04em]',
                  )}
                >
                  {stat.label}
                </p>
                <p
                  className={cn(
                    'mt-1.5 self-start font-brand font-bold tracking-normal text-canvas tabular-nums',
                    'text-[clamp(1rem,0.75rem+2.2vw,1.75rem)] leading-none',
                  )}
                >
                  <AnimatedCounter
                    value={stat.numericValue}
                    formatStyle="integer"
                    locale={locale}
                  />
                  +
                </p>
                {stat.hint.length > 0 ? (
                  <p className="mt-1 max-w-full text-balance text-xs font-medium leading-4 tracking-normal text-stat-positive">
                    {stat.hint}
                  </p>
                ) : (
                  <span className="mt-1 block h-4" aria-hidden />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
