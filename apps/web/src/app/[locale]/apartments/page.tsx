import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { listProjects } from '@/features/catalog/api/catalog-api';
import { BuyApartmentsBrowse } from '@/features/catalog/components/buy-apartments-browse';
import { BuyApartmentsFilters } from '@/features/catalog/components/buy-apartments-filters';
import { SiteFooter } from '@/features/catalog/components/site-footer';
import { loadBuyApartmentListings } from '@/features/catalog/utils/load-buy-apartments';
import { parseProjectFilters } from '@/features/catalog/utils/project-filters';

type ApartmentsIndexPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const generateMetadata = async ({ params }: ApartmentsIndexPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'BuyPage' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
};

/**
 * Public Buy / apartments browse — Figma `103:1437`.
 */
export default async function ApartmentsIndexPage({
  params,
  searchParams,
}: ApartmentsIndexPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const rawParams = await searchParams;
  const filters = parseProjectFilters(rawParams);
  if (!filters.salesStatus) {
    filters.salesStatus = 'available';
  }

  const [listings, projectsForCities] = await Promise.all([
    loadBuyApartmentListings({ locale, filters }),
    listProjects({ page: 1, pageSize: 50, locale }, { locale }),
  ]);

  const cities = [
    ...new Set(
      projectsForCities.data
        .map((project) => project.city?.trim())
        .filter((city): city is string => Boolean(city)),
    ),
  ].sort((a, b) => a.localeCompare(b));

  return (
    <div className="relative min-h-screen">
      {/* Continuous canvas under the whole viewport (incl. overscroll). */}
      <div className="pointer-events-none fixed inset-0 bg-canvas" aria-hidden />
      {/* Opaque band under the navbar so listing cards never scroll through. */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[var(--z-sticky)] h-[4.5rem] bg-canvas"
        aria-hidden
      />
      <div className="relative">
        <main>
          <BuyApartmentsFilters filters={filters} cities={cities} />
          <BuyApartmentsBrowse listings={listings} />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
