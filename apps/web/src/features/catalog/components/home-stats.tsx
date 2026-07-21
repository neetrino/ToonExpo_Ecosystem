import type { ProjectListItem } from '@toonexpo/contracts';
import { getTranslations } from 'next-intl/server';

import { AnimatedCounter } from '@/shared/ui/motion/animated-counter';
import { Reveal } from '@/shared/ui/motion/reveal';

type HomeStatsProps = {
  projects: ProjectListItem[];
  builderCount: number;
  /** Total published projects when list is a page slice. */
  projectTotal?: number | undefined;
};

/**
 * Floating market-pulse stats bar under the hero.
 */
export const HomeStats = async ({ projects, builderCount, projectTotal }: HomeStatsProps) => {
  const t = await getTranslations('HomePage');
  const listingCount = projects.reduce((sum, project) => sum + project.availability.total, 0);
  const availableCount = projects.reduce((sum, project) => sum + project.availability.available, 0);
  const cities = new Set(projects.map((project) => project.city).filter(Boolean)).size;

  const stats = [
    {
      label: t('stats.projects'),
      value: projectTotal ?? projects.length,
      hint: t('stats.projectsHint'),
    },
    {
      label: t('stats.listings'),
      value: listingCount,
      hint: t('stats.availableHint', { count: availableCount }),
    },
    {
      label: t('stats.builders'),
      value: builderCount,
      hint: t('stats.buildersHint'),
    },
    {
      label: t('stats.cities'),
      value: cities || 1,
      hint: t('stats.citiesHint'),
    },
  ];

  return (
    <div className="relative z-10 mx-auto -mt-14 w-full max-w-content px-6 sm:-mt-16">
      <Reveal>
        <div className="border border-border/50 bg-surface-elevated/95 px-5 py-7 shadow-lg backdrop-blur-md sm:px-10">
          <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border/60 pb-4">
            <p className="text-eyebrow mb-0">{t('stats.badge')}</p>
            <span className="hidden h-px flex-1 bg-border/80 sm:block" aria-hidden />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={
                  index === 0 ? 'lg:pr-8' : 'border-border lg:border-l lg:px-8 lg:last:pr-0'
                }
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                  {stat.label}
                </p>
                <p className="mt-2 font-display text-[1.85rem] font-semibold tracking-tight text-ink">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="mt-1 text-xs text-ink-secondary">{stat.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
};
