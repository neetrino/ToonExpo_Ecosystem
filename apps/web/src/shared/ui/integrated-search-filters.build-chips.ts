import { INTEGRATED_SEARCH_FILTER_ALL_VALUE } from '@/shared/ui/integrated-search-filters.constants';
import type {
  ActiveIntegratedFilterChip,
  IntegratedSearchFilterConfig,
} from '@/shared/ui/integrated-search-filters.types';
import { decodeIntegratedFilterIds } from '@/shared/ui/integrated-search-filters.types';

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

    if (filter.multiple) {
      const ids = decodeIntegratedFilterIds(raw);
      if (ids.length === 0) {
        return [];
      }
      if (ids.length === 1) {
        const option = filter.options.find((item) => item.value === ids[0]);
        return [{ key: filter.key, label: `${filter.label}: ${option?.label ?? ids[0]}` }];
      }
      const countLabel = filter.selectedCountLabel?.(ids.length) ?? String(ids.length);
      return [{ key: filter.key, label: `${filter.label}: ${countLabel}` }];
    }

    const option = filter.options.find((item) => item.value === raw);
    const valueLabel = option?.label ?? raw;
    return [{ key: filter.key, label: `${filter.label}: ${valueLabel}` }];
  });
};
