import { INTEGRATED_SEARCH_FILTER_ALL_VALUE } from '@/shared/ui/integrated-search-filters.constants';
import type {
  ActiveIntegratedFilterChip,
  IntegratedSearchFilterConfig,
} from '@/shared/ui/integrated-search-filters.types';

/**
 * Active filter chips for the integrated search bar (non-baseline values only).
 */
export const buildActiveIntegratedFilterChips = (
  filters: readonly IntegratedSearchFilterConfig[] | undefined,
  filterValues: Record<string, string>,
): ActiveIntegratedFilterChip[] => {
  if (!filters?.length) {
    return [];
  }

  return filters.flatMap((filter) => {
    const raw = filterValues[filter.key] ?? INTEGRATED_SEARCH_FILTER_ALL_VALUE;
    if (raw === INTEGRATED_SEARCH_FILTER_ALL_VALUE) {
      return [];
    }
    const option = filter.options.find((item) => item.value === raw);
    const valueLabel = option?.label ?? raw;
    return [{ key: filter.key, label: `${filter.label}: ${valueLabel}` }];
  });
};
