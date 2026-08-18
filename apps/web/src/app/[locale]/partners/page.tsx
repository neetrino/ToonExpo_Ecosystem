import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ExhibitorCatalogBrowser } from '@/features/catalog/components/exhibitor-catalog-browser';
import { SiteFooter } from '@/features/catalog/components/site-footer';
import { loadExhibitorPage } from '@/features/catalog/utils/load-exhibitor-page';
import { parsePartnerFilters } from '@/features/catalog/utils/partner-filters';

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

  const requested = parsePartnerFilters(await searchParams);
  const { filters, catalog, visibleTabs } = await loadExhibitorPage(requested, locale);

  return (
    <div className="min-h-screen bg-canvas">
      <main>
        <ExhibitorCatalogBrowser
          locale={locale}
          initialFilters={filters}
          initialCatalog={catalog}
          visibleTabs={visibleTabs}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
