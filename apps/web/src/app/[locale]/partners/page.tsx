import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import {
  listPublicPartnerFacets,
  listPublicPartners,
} from '@/features/catalog/api/partners-api';
import { PartnerCard } from '@/features/catalog/components/partner-card';
import { PartnerFiltersForm } from '@/features/catalog/components/partner-filters-form';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { PartnersPageHero } from '@/features/catalog/components/partners-page-hero';
import { SiteFooter } from '@/features/catalog/components/site-footer';
import {
  CATALOG_RESULTS_SCROLL_ID,
  CATALOG_RESULTS_SCROLL_MARGIN_CLASS,
} from '@/features/catalog/constants/catalog-list';
import {
  buildPartnerSearchParams,
  parsePartnerFilters,
} from '@/features/catalog/utils/partner-filters';
import { cn } from '@/shared/ui/cn';

type PartnersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const generateMetadata = async ({ params }: PartnersPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });

  return {
    title: t('partnersPage.meta.title'),
    description: t('partnersPage.meta.description'),
  };
};

export default async function PartnersPage({ params, searchParams }: PartnersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Catalog');
  const rawParams = await searchParams;
  const filters = parsePartnerFilters(rawParams);

  const [response, facets] = await Promise.all([
    listPublicPartners(
      {
        page: filters.page,
        ...(filters.types.length > 0 ? { types: filters.types } : {}),
      },
      { locale },
    ),
    listPublicPartnerFacets(),
  ]);

  const buildHref = (page: number): string => {
    const query = new URLSearchParams(buildPartnerSearchParams(filters, page)).toString();
    return query.length > 0 ? `/partners?${query}` : '/partners';
  };

  return (
    <div className="min-h-screen bg-canvas">
      <main>
        <PartnersPageHero
          title={t('partnersPage.title')}
          description={t('partnersPage.subtitle', { count: response.meta.total })}
        />

        <div className="page-container section-pad pt-8 sm:pt-10">
          <PartnerFiltersForm filters={filters} availableTypes={facets.types} />

          {response.data.length === 0 ? (
            <p
              id={CATALOG_RESULTS_SCROLL_ID}
              className={cn(
                'mt-10 rounded-[20px] border border-dashed border-header-border bg-surface-elevated px-6 py-12 text-center text-sm text-header-muted',
                CATALOG_RESULTS_SCROLL_MARGIN_CLASS,
              )}
            >
              {t('partnersPage.empty')}
            </p>
          ) : (
            <div
              id={CATALOG_RESULTS_SCROLL_ID}
              className={cn(
                'mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3',
                CATALOG_RESULTS_SCROLL_MARGIN_CLASS,
              )}
            >
              {response.data.map((partner) => (
                <PartnerCard key={partner.id} partner={partner} />
              ))}
            </div>
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
