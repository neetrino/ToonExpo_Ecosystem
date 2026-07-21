import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { listPublicPartners } from '@/features/catalog/api/partners-api';
import { PartnerCard } from '@/features/catalog/components/partner-card';
import { PartnerFiltersForm } from '@/features/catalog/components/partner-filters-form';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { SiteFooter } from '@/features/catalog/components/site-footer';
import {
  buildPartnerSearchParams,
  parsePartnerFilters,
} from '@/features/catalog/utils/partner-filters';
import { PARTNER_COMPANY_TYPES } from '@/features/partners/constants';
import { SiteHeader } from '@/shared/ui/site-header';

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
  const tPartners = await getTranslations('Partners');
  const rawParams = await searchParams;
  const filters = parsePartnerFilters(rawParams);

  const response = await listPublicPartners(
    {
      page: filters.page,
      ...(filters.type ? { type: filters.type } : {}),
    },
    { locale },
  );

  const buildHref = (page: number): string => {
    const query = new URLSearchParams(buildPartnerSearchParams(filters, page)).toString();
    return query.length > 0 ? `/partners?${query}` : '/partners';
  };

  const typeLabels = Object.fromEntries(
    PARTNER_COMPANY_TYPES.map((type) => [type, tPartners(`types.${type}`)]),
  ) as Record<(typeof PARTNER_COMPANY_TYPES)[number], string>;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="page-container section-pad">
        <header className="mb-8 flex flex-col gap-2">
          <h1 className="text-page-title text-ink">{t('partnersPage.title')}</h1>
          <p className="text-sm text-ink-secondary">
            {t('partnersPage.subtitle', { count: response.meta.total })}
          </p>
        </header>

        <PartnerFiltersForm
          filters={filters}
          labels={{
            type: t('partnersPage.filters.type'),
            allTypes: t('partnersPage.filters.allTypes'),
            types: typeLabels,
            apply: t('partnersPage.filters.apply'),
            reset: t('partnersPage.filters.reset'),
          }}
        />

        {response.data.length === 0 ? (
          <p className="mt-10 rounded-md border border-dashed border-border bg-surface/50 px-6 py-12 text-center text-sm text-ink-secondary">
            {t('partnersPage.empty')}
          </p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {response.data.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
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
      </main>
      <SiteFooter />
    </div>
  );
}
