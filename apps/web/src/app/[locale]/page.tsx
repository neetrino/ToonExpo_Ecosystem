import type { Metadata } from 'next';
import type { PaginatedResponse, ProjectListItem } from '@toonexpo/contracts';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { listBuilders, listProjects } from '@/features/catalog/api/catalog-api';
import { FeaturedApartments } from '@/features/catalog/components/featured-apartments';
import { HomeDevelopments } from '@/features/catalog/components/home-developments';
import { HomeHero } from '@/features/catalog/components/home-hero';
import { HomeMortgage } from '@/features/catalog/components/home-mortgage';
import { HomeStats } from '@/features/catalog/components/home-stats';
import { SiteFooter } from '@/features/catalog/components/site-footer';
import { HOME_HERO_CATALOG_PAGE_SIZE } from '@/features/catalog/constants/hero-search';
import { loadBuyApartmentListings } from '@/features/catalog/utils/load-buy-apartments';
import { collectProjectCities } from '@/features/catalog/utils/location-options';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

const HOME_FEATURED_PAGE_SIZE = 7;
const HOME_FEATURED_APARTMENT_LIMIT = 6;

const emptyProjectPage = (pageSize: number): PaginatedResponse<ProjectListItem> => ({
  data: [],
  meta: { page: 1, pageSize, total: 0, totalPages: 0 },
});

export const generateMetadata = async ({ params }: HomePageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
};

/**
 * Public home — soft-fails catalog fetches so `next build` can prerender
 * locales when the Nest API is not reachable (local / offline builds).
 */
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [catalogResponse, featuredApartments, builders] = await Promise.all([
    listProjects({ page: 1, pageSize: HOME_HERO_CATALOG_PAGE_SIZE }, { locale }).catch(() =>
      emptyProjectPage(HOME_HERO_CATALOG_PAGE_SIZE),
    ),
    loadBuyApartmentListings({
      locale,
      filters: { salesStatus: 'available' },
      limit: HOME_FEATURED_APARTMENT_LIMIT,
    }).catch(() => []),
    listBuilders({ locale }).catch(() => []),
  ]);

  const catalogProjects = catalogResponse.data;
  const featuredProjects = catalogProjects.slice(0, HOME_FEATURED_PAGE_SIZE);
  const locations = collectProjectCities(catalogProjects);

  return (
    <div className="min-h-screen bg-canvas">
      <HomeHero locations={locations} projects={catalogProjects} />
      <HomeStats
        projects={featuredProjects}
        builderCount={builders.length}
        projectTotal={catalogResponse.meta.total}
      />
      <FeaturedApartments listings={featuredApartments} />
      <HomeDevelopments projects={featuredProjects} />
      <HomeMortgage />
      <SiteFooter />
    </div>
  );
}
