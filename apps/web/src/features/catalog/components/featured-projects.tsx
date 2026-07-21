import type { ProjectListItem } from '@toonexpo/contracts';
import { getTranslations } from 'next-intl/server';

import { ProjectCard } from '@/features/catalog/components/project-card';
import { ProjectPriceRangesOverlayScope } from '@/features/catalog/components/price-overlay-scope';
import { CatalogFavoritesScope } from '@/features/buyer/components/catalog-favorites-scope';
import { Link } from '@/i18n/navigation';
import { EmptyState } from '@/shared/ui/empty-state';
import { Reveal } from '@/shared/ui/motion/reveal';
import { SectionHeader } from '@/shared/ui/section-header';
import { StaggerGroup } from '@/shared/ui/motion/stagger-group';

type FeaturedProjectsProps = {
  projects: ProjectListItem[];
};

/**
 * Home featured projects band.
 */
export const FeaturedProjects = async ({ projects }: FeaturedProjectsProps) => {
  const t = await getTranslations('HomePage');
  const [featured, ...rest] = projects;

  return (
    <section className="section-pad">
      <div className="page-container">
        <Reveal>
          <SectionHeader
            eyebrow={t('featured.eyebrow')}
            title={t('featured.title')}
            action={
              <Link
                href="/projects"
                className="text-sm font-semibold text-ink transition-colors hover:text-brand"
              >
                {t('featured.viewAll')}
              </Link>
            }
          />
        </Reveal>

        {featured ? (
          <CatalogFavoritesScope projects={projects}>
            <ProjectPriceRangesOverlayScope projectIds={projects.map((project) => project.id)}>
              <Reveal delayMs={60}>
                <div className="mb-4">
                  <ProjectCard project={featured} featured className="sm:flex-row" showFavorite />
                </div>
              </Reveal>

              {rest.length > 0 ? (
                <StaggerGroup
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  baseDelayMs={100}
                >
                  {rest.map((project) => (
                    <ProjectCard key={project.id} project={project} featured showFavorite />
                  ))}
                </StaggerGroup>
              ) : null}
            </ProjectPriceRangesOverlayScope>
          </CatalogFavoritesScope>
        ) : (
          <EmptyState title={t('featured.empty')} />
        )}
      </div>
    </section>
  );
};
