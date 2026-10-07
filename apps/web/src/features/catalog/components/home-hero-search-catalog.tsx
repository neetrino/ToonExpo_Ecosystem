import type { PaginatedResponse, ProjectListItem } from '@toonexpo/contracts';

import { listProjects } from '@/features/catalog/api/catalog-api';
import { HeroSearch } from '@/features/catalog/components/hero-search';
import { HOME_HERO_CATALOG_PAGE_SIZE } from '@/features/catalog/constants/hero-search';
import { collectProjectCities } from '@/features/catalog/utils/location-options';

type HomeHeroSearchCatalogProps = {
  locale: string;
};

const emptyCatalog = (): PaginatedResponse<ProjectListItem> => ({
  data: [],
  meta: { page: 1, pageSize: HOME_HERO_CATALOG_PAGE_SIZE, total: 0, totalPages: 0 },
});

/**
 * Keyword suggestions for the home hero. Isolated so the hero photo can paint
 * before the full catalog list (the slowest homepage query) returns.
 */
export const HomeHeroSearchCatalog = async ({ locale }: HomeHeroSearchCatalogProps) => {
  const catalog = await listProjects(
    { page: 1, pageSize: HOME_HERO_CATALOG_PAGE_SIZE },
    { locale },
  ).catch(() => emptyCatalog());
  const projects = catalog.data;

  return <HeroSearch locations={collectProjectCities(projects)} projects={projects} />;
};
