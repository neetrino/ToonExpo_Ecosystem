import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { listProjects } from '@/features/catalog/api/catalog-api';
import { CatalogFavoritesScope } from '@/features/buyer/components/catalog-favorites-scope';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { ProjectCard } from '@/features/catalog/components/project-card';
import { ProjectPriceRangesOverlayScope } from '@/features/catalog/components/price-overlay-scope';
import { ProjectFiltersForm } from '@/features/catalog/components/project-filters-form';
import { ProjectsPageHero } from '@/features/catalog/components/projects-page-hero';
import { SiteFooter } from '@/features/catalog/components/site-footer';
import {
  buildProjectSearchParams,
  parseProjectFilters,
  toListProjectsQuery,
} from '@/features/catalog/utils/project-filters';

type ProjectsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const generateMetadata = async ({ params }: ProjectsPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });

  return {
    title: t('projects.meta.title'),
    description: t('projects.meta.description'),
  };
};

export default async function ProjectsPage({ params, searchParams }: ProjectsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Catalog');
  const rawParams = await searchParams;
  const filters = parseProjectFilters(rawParams);
  const response = await listProjects(toListProjectsQuery(filters), { locale });

  const buildHref = (page: number): string => {
    const query = new URLSearchParams(buildProjectSearchParams(filters, page)).toString();
    return query.length > 0 ? `/projects?${query}` : '/projects';
  };

  return (
    <div className="min-h-screen bg-canvas">
      <main>
        <ProjectsPageHero
          title={t('projects.title')}
          description={t('projects.subtitle', { count: response.meta.total })}
        />

        <div className="page-container section-pad pt-8 sm:pt-10">
          <ProjectFiltersForm filters={filters} />

          {response.data.length === 0 ? (
            <p className="mt-10 rounded-[20px] border border-dashed border-header-border bg-surface-elevated px-6 py-12 text-center text-sm text-header-muted">
              {t('projects.empty')}
            </p>
          ) : (
            <CatalogFavoritesScope projects={response.data}>
              <ProjectPriceRangesOverlayScope
                projectIds={response.data.map((project) => project.id)}
              >
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {response.data.map((project) => (
                    <ProjectCard key={project.id} project={project} showFavorite />
                  ))}
                </div>
              </ProjectPriceRangesOverlayScope>
            </CatalogFavoritesScope>
          )}

          <CatalogPagination
            className="mt-10"
            page={response.meta.page}
            totalPages={response.meta.totalPages}
            buildHref={buildHref}
            previousLabel={t('pagination.previous')}
            nextLabel={t('pagination.next')}
            ariaLabel={t('pagination.ariaLabel')}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
