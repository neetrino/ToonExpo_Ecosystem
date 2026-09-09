import { listBuilders } from '@/features/catalog/api/catalog-api';
import { listPublicPartnerFacets } from '@/features/catalog/api/partners-api';
import {
  isExhibitorAllTab,
  isExhibitorBuilderTab,
  type ExhibitorTab,
} from '@/features/catalog/constants/exhibitor-tabs';
import {
  filterBuildersByQuery,
  loadExhibitorCatalog,
  loadExhibitorPartners,
  toAllExhibitorsCatalog,
  type ExhibitorCatalog,
} from '@/features/catalog/utils/load-exhibitor-catalog';
import {
  resolveExhibitorFilters,
  resolveVisibleExhibitorTabs,
} from '@/features/catalog/utils/resolve-visible-exhibitor-tabs';
import type { PartnerListFilters } from '@/features/catalog/utils/partner-filters';

export type ExhibitorPageData = {
  filters: PartnerListFilters;
  catalog: ExhibitorCatalog;
  visibleTabs: ExhibitorTab[];
};

/**
 * Loads exhibitors for the requested tab and the non-empty category tabs.
 */
export const loadExhibitorPage = async (
  requested: PartnerListFilters,
  locale: string,
): Promise<ExhibitorPageData> => {
  const [builders, facets] = await Promise.all([
    listBuilders({ locale }).catch(() => []),
    listPublicPartnerFacets().catch(() => ({ types: [] })),
  ]);
  const visibleTabs = resolveVisibleExhibitorTabs(builders.length > 0, facets.types);
  const filters = resolveExhibitorFilters(requested, visibleTabs);
  const { tab } = filters;

  if (isExhibitorBuilderTab(tab)) {
    return {
      filters,
      visibleTabs,
      catalog: { kind: 'builders', builders: filterBuildersByQuery(builders, filters.q) },
    };
  }

  if (isExhibitorAllTab(tab)) {
    const response = await loadExhibitorPartners(filters, locale);
    return {
      filters,
      visibleTabs,
      catalog: toAllExhibitorsCatalog(builders, filters, response),
    };
  }

  const catalog = await loadExhibitorCatalog(filters, locale);
  return { filters, visibleTabs, catalog };
};
