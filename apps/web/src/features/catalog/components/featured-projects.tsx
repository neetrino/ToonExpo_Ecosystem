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
 * Home featured listings grid — Figma section `81:170` / grid `81:176`.
 */
export const FeaturedProjects = async ({ projects }: FeaturedProjectsProps) => {
  const t = await getTranslations('HomePage');

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
                className="shrink-0 pb-1 text-sm font-semibold text-brand-deep transition-colors hover:text-brand-deep/80"
              >
                {t('featured.viewAll')}
              </Link>
            }
          />
        </Reveal>

        {projects.length > 0 ? (
          <CatalogFavoritesScope projects={projects}>
            <ProjectPriceRangesOverlayScope projectIds={projects.map((project) => project.id)}>
              <StaggerGroup
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                baseDelayMs={80}
              >
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} featured showFavorite />
                ))}
              </StaggerGroup>
            </ProjectPriceRangesOverlayScope>
          </CatalogFavoritesScope>
        ) : (
          <EmptyState title={t('featured.empty')} />
        )}
      </div>
    </section>
  );
};
