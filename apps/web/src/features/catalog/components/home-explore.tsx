import type { ProjectListItem } from '@toonexpo/contracts';
import { MapPin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { Reveal } from '@/shared/ui/motion/reveal';
import { SectionHeader } from '@/shared/ui/section-header';

type HomeExploreProps = {
  projects: ProjectListItem[];
};

/**
 * Explore-by-location chips derived from live catalog data.
 */
export const HomeExplore = async ({ projects }: HomeExploreProps) => {
  const t = await getTranslations('HomePage');

  const cities = [
    ...new Set(
      projects
        .map((project) => project.city?.trim())
        .filter((city): city is string => Boolean(city)),
    ),
  ].slice(0, 8);

  const districts = [
    ...new Set(
      projects
        .map((project) => project.district?.trim())
        .filter((district): district is string => Boolean(district)),
    ),
  ]
    .filter((district) => !cities.includes(district))
    .slice(0, 6);

  const locationLabels = [...cities, ...districts];

  if (locationLabels.length === 0) {
    return null;
  }

  return (
    <section className="section-pad">
      <div className="page-container">
        <Reveal>
          <SectionHeader
            eyebrow={t('explore.eyebrow')}
            title={t('explore.title')}
            description={t('explore.description')}
          />
        </Reveal>
        <Reveal delayMs={80}>
          <ul className="flex flex-wrap gap-2.5">
            {locationLabels.map((label) => (
              <li key={label}>
                <Link
                  href={`/projects?city=${encodeURIComponent(label)}`}
                  className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface-elevated px-4 py-2.5 text-sm font-medium text-ink shadow-xs transition-colors hover:border-brand/40 hover:bg-brand-soft hover:text-brand"
                >
                  <MapPin className="size-3.5 opacity-70" aria-hidden />
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/projects"
                className="inline-flex items-center rounded-pill bg-cta-dark px-4 py-2.5 text-sm font-medium text-on-dark transition-colors hover:bg-cta-dark/90"
              >
                {t('explore.allProjects')}
              </Link>
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
};
