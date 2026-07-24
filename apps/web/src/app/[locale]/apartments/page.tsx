import type { Metadata } from 'next';
import type { PaginatedResponse, ProjectListItem } from '@toonexpo/contracts';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { listProjects } from '@/features/catalog/api/catalog-api';
import { BuyApartmentsBrowse } from '@/features/catalog/components/buy-apartments-browse';
import { BuyApartmentsFilters } from '@/features/catalog/components/buy-apartments-filters';
import { SiteFooter } from '@/features/catalog/components/site-footer';
import { loadBuyApartmentListings } from '@/features/catalog/utils/load-buy-apartments';
import { parseProjectFilters } from '@/features/catalog/utils/project-filters';

const CITY_PROJECTS_PAGE_SIZE = 50;

type ApartmentsIndexPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const emptyProjectPage = (pageSize: number): PaginatedResponse<ProjectListItem> => ({
  data: [],
  meta: { page: 1, pageSize, total: 0, totalPages: 0 },
});

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
 * Soft-fails catalog fetches so `next build` can prerender when Nest is offline.
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
    loadBuyApartmentListings({ locale, filters }).catch(() => []),
    listProjects({ page: 1, pageSize: CITY_PROJECTS_PAGE_SIZE, locale }, { locale }).catch(() =>
      emptyProjectPage(CITY_PROJECTS_PAGE_SIZE),
    ),
  ]);

  const cities = [
    ...new Set(
      projectsForCities.data
        .map((project) => project.city?.trim())
        .filter((city): city is string => Boolean(city)),
    ),
  ].sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-canvas">
      {/* Opaque shield so list/map never show through the frosted header. */}
      <div className="fixed inset-x-0 top-0 z-[var(--z-sticky)] h-[4.5rem] bg-canvas" aria-hidden />
      <main className="bg-canvas">
        <BuyApartmentsFilters filters={filters} cities={cities} />
        <BuyApartmentsBrowse listings={listings} />
      </main>
      <SiteFooter />
    </div>
  );
}
