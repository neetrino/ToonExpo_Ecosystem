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
    <div className="relative z-10 mx-auto -mt-16 w-full max-w-content px-6">
      <Reveal>
        <div className="rounded-lg border border-border/70 bg-surface-elevated px-5 py-6 shadow-card sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <span className="shrink-0 rounded-pill border border-border-strong bg-background/70 px-4 py-1.5 text-xs font-medium tracking-wide text-ink-label">
              {t('stats.badge')}
            </span>
            <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="border-border sm:border-r sm:pr-4 sm:last:border-r-0"
                >
                  <p className="text-center text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-center font-brand text-2xl font-bold text-ink">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="mt-0.5 text-center text-xs font-medium text-success">{stat.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
};
