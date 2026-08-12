import type { Metadata } from 'next';
import type { PaginatedResponse, ProjectListItem } from '@toonexpo/contracts';
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
  CATALOG_RESULTS_SCROLL_ID,
  CATALOG_RESULTS_SCROLL_MARGIN_CLASS,
} from '@/features/catalog/constants/catalog-list';
import { cn } from '@/shared/ui/cn';
import {
  LIST_CARD_DURATION_MS,
  LIST_CARD_STAGGER_MS,
  LIST_CONTENT_BASE_DELAY_MS,
  StaggerGroup,
} from '@/shared/ui/motion';
import {
  buildProjectSearchParams,
  parseProjectFilters,
  toListProjectsQuery,
} from '@/features/catalog/utils/project-filters';

type ProjectsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const emptyProjectPage = (pageSize: number): PaginatedResponse<ProjectListItem> => ({
  data: [],
  meta: { page: 1, pageSize, total: 0, totalPages: 0 },
});

export const generateMetadata = async ({ params }: ProjectsPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });

  return {
    title: t('projects.meta.title'),
    description: t('projects.meta.description'),
  };
};

/**
 * Soft-fails catalog fetch so `next build` can prerender when Nest is offline.
 */
export default async function ProjectsPage({ params, searchParams }: ProjectsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Catalog');
  const rawParams = await searchParams;
  const filters = parseProjectFilters(rawParams);
  const query = toListProjectsQuery(filters);
  const response = await listProjects(query, { locale }).catch(() =>
    emptyProjectPage(query.pageSize ?? 1),
  );

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
            <p
              id={CATALOG_RESULTS_SCROLL_ID}
              className={cn(
                'mt-10 rounded-[20px] border border-dashed border-header-border bg-surface-elevated px-6 py-12 text-center text-sm text-header-muted',
                CATALOG_RESULTS_SCROLL_MARGIN_CLASS,
              )}
            >
              {filters.q
                ? t('projects.searchEmpty', { query: filters.q })
                : t('projects.empty')}
            </p>
          ) : (
            <CatalogFavoritesScope projects={response.data}>
              <ProjectPriceRangesOverlayScope
                projectIds={response.data.map((project) => project.id)}
              >
                <StaggerGroup
                  force
                  id={CATALOG_RESULTS_SCROLL_ID}
                  className={cn(
                    'mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 [&>*]:h-full [&>*]:min-w-0',
                    CATALOG_RESULTS_SCROLL_MARGIN_CLASS,
                  )}
                  baseDelayMs={LIST_CONTENT_BASE_DELAY_MS}
                  staggerMs={LIST_CARD_STAGGER_MS}
                  durationMs={LIST_CARD_DURATION_MS}
                >
                  {response.data.map((project) => (
                    <ProjectCard key={project.id} project={project} showFavorite />
                  ))}
                </StaggerGroup>
              </ProjectPriceRangesOverlayScope>
            </CatalogFavoritesScope>
          )}

          <CatalogPagination
            className="mt-10"
            page={response.meta.page}
            totalPages={response.meta.totalPages}
            previousHref={
              response.meta.page > 1 ? buildHref(response.meta.page - 1) : null
            }
            nextHref={
              response.meta.page < response.meta.totalPages
                ? buildHref(response.meta.page + 1)
                : null
            }
            previousLabel={t('pagination.previous')}
            nextLabel={t('pagination.next')}
            ariaLabel={t('pagination.ariaLabel')}
            scrollTargetId={CATALOG_RESULTS_SCROLL_ID}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
