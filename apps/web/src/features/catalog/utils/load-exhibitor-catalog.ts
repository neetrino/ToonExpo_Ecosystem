import type { BuilderSummary, PublicPartnerListResponse } from '@toonexpo/contracts';

import { listBuilders } from '@/features/catalog/api/catalog-api';
import { listPublicPartners } from '@/features/catalog/api/partners-api';
import { isExhibitorBuilderTab } from '@/features/catalog/constants/exhibitor-tabs';
import type { PartnerListFilters } from '@/features/catalog/utils/partner-filters';

export type ExhibitorCatalog =
  | { kind: 'builders'; builders: BuilderSummary[] }
  | { kind: 'partners'; response: PublicPartnerListResponse };

const BUILDER_SEARCH_FIELDS = [
  'name',
  'shortDescription',
  'region',
  'address',
] as const;

/**
 * Client-side keyword filter for the full builders list.
 */
export const filterBuildersByQuery = (
  builders: readonly BuilderSummary[],
  q: string | undefined,
): BuilderSummary[] => {
  const keyword = q?.trim().toLowerCase() ?? '';
  if (keyword.length === 0) {
    return [...builders];
  }
  return builders.filter((builder) =>
    BUILDER_SEARCH_FIELDS.some((field) => {
      const value = builder[field];
      return value != null && value.toLowerCase().includes(keyword);
    }),
  );
};

/**
 * Loads the active exhibitors tab: builders catalog or a partner type page.
 */
export const loadExhibitorCatalog = async (
  filters: PartnerListFilters,
  locale: string,
): Promise<ExhibitorCatalog> => {
  if (isExhibitorBuilderTab(filters.tab)) {
    const builders = await listBuilders({ locale }).catch(() => []);
    return { kind: 'builders', builders: filterBuildersByQuery(builders, filters.q) };
  }

  const response = await listPublicPartners(
    {
      page: filters.page,
      types: [filters.tab],
      ...(filters.q ? { q: filters.q } : {}),
    },
    { locale },
  );
  return { kind: 'partners', response };
};
