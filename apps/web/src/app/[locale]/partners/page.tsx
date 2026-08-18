import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ExhibitorCatalogSection } from '@/features/catalog/components/exhibitor-catalog-section';
import { PartnersPageHero } from '@/features/catalog/components/partners-page-hero';
import { SiteFooter } from '@/features/catalog/components/site-footer';
import { loadExhibitorCatalog } from '@/features/catalog/utils/load-exhibitor-catalog';
import {
  buildPartnerSearchParams,
  parsePartnerFilters,
} from '@/features/catalog/utils/partner-filters';

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
  const filters = parsePartnerFilters(await searchParams);
  const catalog = await loadExhibitorCatalog(filters, locale);
  const showBuilders = catalog.kind === 'builders';
  const total = showBuilders ? catalog.builders.length : catalog.response.meta.total;
  const page = showBuilders ? 1 : catalog.response.meta.page;
  const totalPages = showBuilders ? 1 : catalog.response.meta.totalPages;
  const hrefFor = (nextPage: number): string =>
    `/partners?${new URLSearchParams(buildPartnerSearchParams(filters, nextPage)).toString()}`;

  return (
    <div className="min-h-screen bg-canvas">
      <main>
        <PartnersPageHero
          title={t('partnersPage.title')}
          description={
            showBuilders
              ? t('buildersPage.subtitle', { count: total })
              : t('partnersPage.subtitle', { count: total })
          }
        />
        <ExhibitorCatalogSection
          activeTab={filters.tab}
          emptyLabel={showBuilders ? t('buildersPage.empty') : t('partnersPage.empty')}
          builders={showBuilders ? catalog.builders : undefined}
          partners={showBuilders ? undefined : catalog.response.data}
          page={page}
          totalPages={totalPages}
          previousHref={page > 1 ? hrefFor(page - 1) : null}
          nextHref={page < totalPages ? hrefFor(page + 1) : null}
          previousLabel={t('pagination.previous')}
          nextLabel={t('pagination.next')}
          paginationAriaLabel={t('pagination.ariaLabel')}
          showPagination={!showBuilders}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
