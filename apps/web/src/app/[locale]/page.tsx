import type { Metadata } from 'next';
import type { PaginatedResponse, ProjectListItem } from '@toonexpo/contracts';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { listBuilders, listProjects } from '@/features/catalog/api/catalog-api';
import { listPublicPartners } from '@/features/catalog/api/partners-api';
import { FeaturedProjects } from '@/features/catalog/components/featured-projects';
import { HomeBuilders } from '@/features/catalog/components/home-builders';
import { HomeDevelopments } from '@/features/catalog/components/home-developments';
import { HomeExhibition } from '@/features/catalog/components/home-exhibition';
import { HomeExplore } from '@/features/catalog/components/home-explore';
import { HomeFinalCta } from '@/features/catalog/components/home-final-cta';
import { HomeHero } from '@/features/catalog/components/home-hero';
import { HomeMortgage } from '@/features/catalog/components/home-mortgage';
import { HomePartners } from '@/features/catalog/components/home-partners';
import { HomeStats } from '@/features/catalog/components/home-stats';
import { SiteFooter } from '@/features/catalog/components/site-footer';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

const HOME_FEATURED_PAGE_SIZE = 7;
const HOME_EXPLORE_PAGE_SIZE = 24;
const HOME_PARTNERS_PAGE_SIZE = 6;

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

  const [projectsResponse, builders, partnersResponse] = await Promise.all([
    listProjects({ page: 1, pageSize: HOME_FEATURED_PAGE_SIZE }, { locale }).catch(() =>
      emptyProjectPage(HOME_FEATURED_PAGE_SIZE),
    ),
    listBuilders({ locale }).catch(() => []),
    listPublicPartners({ page: 1, pageSize: HOME_PARTNERS_PAGE_SIZE }, { locale }).catch(() => ({
      data: [],
      meta: {
        page: 1,
        pageSize: HOME_PARTNERS_PAGE_SIZE,
        total: 0,
        totalPages: 0,
      },
    })),
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
    <div className="min-h-screen bg-background">
      <HomeHero />
      <HomeStats
        projects={projectsResponse.data}
        builderCount={builders.length}
        projectTotal={projectsResponse.meta.total}
      />
      <FeaturedProjects projects={projectsResponse.data} />
      <HomeDevelopments projects={exploreProjects} />
      <HomeExplore projects={exploreProjects} />
      <HomeBuilders builders={builders} />
      <HomeExhibition />
      <HomeMortgage />
      <HomePartners partners={partnersResponse.data} />
      <HomeFinalCta />
      <SiteFooter />
    </div>
  );
}
