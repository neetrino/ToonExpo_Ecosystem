import type { ProjectListItem } from '@toonexpo/contracts';
import { getTranslations } from 'next-intl/server';

import { DevelopmentProgressCard } from '@/features/catalog/components/development-progress-card';
import { HomeDevelopmentsMap } from '@/features/catalog/components/home-developments-map';
import { Link } from '@/i18n/navigation';
import { EmptyState } from '@/shared/ui/empty-state';
import { Reveal } from '@/shared/ui/motion/reveal';
import { SectionHeader } from '@/shared/ui/section-header';
import { StaggerGroup } from '@/shared/ui/motion/stagger-group';

type HomeDevelopmentsProps = {
  projects: ProjectListItem[];
};

const WATCH_CARD_COUNT = 3;

/**
 * Under-construction developments + map view — Figma section `81:297`.
 */
export const HomeDevelopments = async ({ projects }: HomeDevelopmentsProps) => {
  const t = await getTranslations('HomePage.developments');
  const watchProjects = projects.slice(0, WATCH_CARD_COUNT);
  const mapProjects = projects.filter((project) => Boolean(project.latitude && project.longitude));
  const mapSeed = mapProjects.length > 0 ? mapProjects : projects;

  return (
    <section className="border-y border-header-border bg-band-mist/30">
      <div className="page-container section-pad">
        <Reveal>
          <SectionHeader
            eyebrow={t('eyebrow')}
            title={t('title')}
            action={
              <Link
                href="/developments"
                className="shrink-0 pb-1 text-sm font-semibold text-brand-deep transition-colors hover:text-brand-deep/80"
              >
                {t('viewAll')}
              </Link>
            }
          />
        </Reveal>

        {watchProjects.length === 0 ? (
          <EmptyState title={t('empty')} />
        ) : (
          <StaggerGroup className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {watchProjects.map((project, index) => (
              <DevelopmentProgressCard key={project.id} project={project} priority={index === 0} />
            ))}
          </StaggerGroup>
        )}

        {mapSeed.length > 0 ? (
          <div className="mt-16">
            <Reveal>
              <SectionHeader
                className="mb-6"
                eyebrow={t('mapEyebrow')}
                title={t('mapTitle')}
                action={
                  <Link
                    href="/developments"
                    className="shrink-0 pb-1 text-sm font-semibold text-brand-deep transition-colors hover:text-brand-deep/80"
                  >
                    {t('browseList')}
                  </Link>
                }
              />
            </Reveal>
            {/* No Reveal around the map — CSS transform/opacity breaks MapLibre WebGL pins. */}
            <HomeDevelopmentsMap projects={mapSeed} />
          </div>
        ) : null}
      </div>
    </section>
  );
};
