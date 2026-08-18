import { listBuilders } from '@/features/catalog/api/catalog-api';
import { listPublicPartnerFacets } from '@/features/catalog/api/partners-api';
import { isExhibitorBuilderTab, type ExhibitorTab } from '@/features/catalog/constants/exhibitor-tabs';
import {
  loadExhibitorCatalog,
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

  if (isExhibitorBuilderTab(filters.tab)) {
    return { filters, visibleTabs, catalog: { kind: 'builders', builders } };
  }

  const catalog = await loadExhibitorCatalog(filters, locale);
  return { filters, visibleTabs, catalog };
};
