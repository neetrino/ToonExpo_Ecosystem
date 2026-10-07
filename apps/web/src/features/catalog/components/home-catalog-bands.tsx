import { listProjects } from '@/features/catalog/api/catalog-api';
import { FeaturedApartments } from '@/features/catalog/components/featured-apartments';
import { HomeDevelopments } from '@/features/catalog/components/home-developments';
import { HOME_FEATURED_PROJECT_LIMIT } from '@/features/catalog/constants/home-featured';
import { loadHomeFeaturedApartments } from '@/features/catalog/utils/load-home-featured-apartments';

type HomeCatalogBandsProps = {
  locale: string;
};

const emptyFeaturedProjects = () => ({
  data: [],
});

/**
 * Below-fold homepage bands. Streamed separately so the hero is not blocked
 * on featured project and apartment queries.
 */
export const HomeCatalogBands = async ({ locale }: HomeCatalogBandsProps) => {
  const [featuredProjects, featuredApartments] = await Promise.all([
    listProjects(
      { page: 1, pageSize: HOME_FEATURED_PROJECT_LIMIT, featuredOnHome: true },
      { locale, cacheMode: 'home-shell' },
    ).catch(() => emptyFeaturedProjects()),
    loadHomeFeaturedApartments(locale).catch(() => []),
  ]);

  return (
    <>
      <HomeDevelopments projects={featuredProjects.data} />
      <FeaturedApartments listings={featuredApartments} />
    </>
  );
};
