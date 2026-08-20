import {
  EXHIBITOR_TAB_BUILDER,
  EXHIBITOR_TABS,
  isExhibitorTab,
  type ExhibitorTab,
} from '@/features/catalog/constants/exhibitor-tabs';
import {
  toPartnerListFilters,
  type PartnerListFilters,
} from '@/features/catalog/utils/partner-filters';

/**
 * Builders first, then partner types that currently have published profiles.
 */
export const resolveVisibleExhibitorTabs = (
  hasBuilders: boolean,
  partnerTypes: readonly string[],
): ExhibitorTab[] => {
  const available = new Set(partnerTypes.filter(isExhibitorTab));
  return EXHIBITOR_TABS.filter((tab) =>
    tab === EXHIBITOR_TAB_BUILDER ? hasBuilders : available.has(tab),
  );
};

/**
 * If the URL tab is empty, fall back to the first category that has items.
 */
export const resolveExhibitorFilters = (
  filters: PartnerListFilters,
  visibleTabs: readonly ExhibitorTab[],
): PartnerListFilters => {
  if (visibleTabs.includes(filters.tab)) {
    return filters;
  }
  const fallback = visibleTabs[0];
  if (fallback == null) {
    return filters;
  }
  return toPartnerListFilters(fallback, 1, filters.q);
};
