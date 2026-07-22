import type { Metadata } from 'next';
import type { PaginatedResponse, ProjectListItem } from '@toonexpo/contracts';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { listBuilders, listProjects } from '@/features/catalog/api/catalog-api';
import { FeaturedProjects } from '@/features/catalog/components/featured-projects';
import { HomeDevelopments } from '@/features/catalog/components/home-developments';
import { HomeHero } from '@/features/catalog/components/home-hero';
import { HomeMortgage } from '@/features/catalog/components/home-mortgage';
import { HomeStats } from '@/features/catalog/components/home-stats';
import { SiteFooter } from '@/features/catalog/components/site-footer';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

const HOME_FEATURED_PAGE_SIZE = 7;
const HOME_EXPLORE_PAGE_SIZE = 24;

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

  const [projectsResponse, builders] = await Promise.all([
    listProjects({ page: 1, pageSize: HOME_FEATURED_PAGE_SIZE }, { locale }).catch(() =>
      emptyProjectPage(HOME_FEATURED_PAGE_SIZE),
    ),
    listBuilders({ locale }).catch(() => []),
  ]);

  const exploreProjects =
    projectsResponse.data.length > 0
      ? projectsResponse.data
      : (
          await listProjects({ page: 1, pageSize: HOME_EXPLORE_PAGE_SIZE }, { locale }).catch(() =>
            emptyProjectPage(HOME_EXPLORE_PAGE_SIZE),
          )
        ).data;

  return (
    <div className="min-h-screen bg-canvas">
      <HomeHero />
      <HomeStats
        projects={projectsResponse.data}
        builderCount={builders.length}
        projectTotal={projectsResponse.meta.total}
      />
      <FeaturedProjects projects={projectsResponse.data} />
      <HomeDevelopments projects={exploreProjects} />
      <HomeMortgage />
      <SiteFooter />
    </div>
  );
}
