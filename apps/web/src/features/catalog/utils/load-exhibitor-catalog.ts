import type { BuilderSummary, PublicPartnerListResponse } from '@toonexpo/contracts';

import { listBuilders } from '@/features/catalog/api/catalog-api';
import { listPublicPartners } from '@/features/catalog/api/partners-api';
import {
  EXHIBITOR_FIRST_PAGE,
  isExhibitorAllTab,
  isExhibitorBuilderTab,
  type ExhibitorPartnerTab,
} from '@/features/catalog/constants/exhibitor-tabs';
import type { PartnerListFilters } from '@/features/catalog/utils/partner-filters';

export type ExhibitorCatalog =
  | { kind: 'builders'; builders: BuilderSummary[] }
  | { kind: 'partners'; response: PublicPartnerListResponse }
  | {
      kind: 'all';
      /** Builders rendered on the current page (first page only). */
      builders: BuilderSummary[];
      /** Builders matching the keyword across all pages — used for the header count. */
      buildersTotal: number;
      response: PublicPartnerListResponse;
    };

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
 * Loads one page of partner profiles; omitting `types` returns every type.
 */
export const loadExhibitorPartners = (
  filters: PartnerListFilters,
  locale: string,
  types?: readonly ExhibitorPartnerTab[] | undefined,
): Promise<PublicPartnerListResponse> =>
  listPublicPartners(
    {
      page: filters.page,
      ...(types != null ? { types: [...types] } : {}),
      ...(filters.q ? { q: filters.q } : {}),
    },
    { locale },
  );

/**
 * Combined tab catalog — builders render on the first page only, so paging through
 * partner profiles never repeats them.
 */
export const toAllExhibitorsCatalog = (
  builders: readonly BuilderSummary[],
  filters: PartnerListFilters,
  response: PublicPartnerListResponse,
): ExhibitorCatalog => {
  const matched = filterBuildersByQuery(builders, filters.q);

  return {
    kind: 'all',
    builders: filters.page === EXHIBITOR_FIRST_PAGE ? matched : [],
    buildersTotal: matched.length,
    response,
  };
};

/**
 * Loads the active exhibitors tab: every exhibitor, the builders catalog or a partner type page.
 */
export const loadExhibitorCatalog = async (
  filters: PartnerListFilters,
  locale: string,
): Promise<ExhibitorCatalog> => {
  const { tab } = filters;

  if (isExhibitorBuilderTab(tab)) {
    const builders = await listBuilders({ locale }).catch(() => []);
    return { kind: 'builders', builders: filterBuildersByQuery(builders, filters.q) };
  }

  if (isExhibitorAllTab(tab)) {
    const [builders, response] = await Promise.all([
      listBuilders({ locale }).catch(() => []),
      loadExhibitorPartners(filters, locale),
    ]);
    return toAllExhibitorsCatalog(builders, filters, response);
  }

  const response = await loadExhibitorPartners(filters, locale, [tab]);
  return { kind: 'partners', response };
};
