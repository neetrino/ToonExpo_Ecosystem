import {
  INTEGRATED_SEARCH_FILTER_ALL_VALUE,
  INTEGRATED_SEARCH_FILTER_SUMMARY_CHIP_KEY,
  INTEGRATED_SEARCH_INLINE_SELECTION_LIMIT,
} from '@/shared/ui/integrated-search-filters.constants';
import type {
  ActiveIntegratedFilterChip,
  IntegratedSearchFilterConfig,
} from '@/shared/ui/integrated-search-filters.types';
import {
  decodeIntegratedFilterIds,
  encodeIntegratedFilterChipKey,
  encodeIntegratedFilterIds,
  parseIntegratedFilterChipKey,
} from '@/shared/ui/integrated-search-filters.types';

export { parseIntegratedFilterChipKey };

type BuildActiveIntegratedFilterChipsOptions = {
  summaryCountLabel?: ((count: number) => string) | undefined;
};

const countActiveSelections = (
  filters: readonly IntegratedSearchFilterConfig[],
  filterValues: Record<string, string>,
): number => {
  let total = 0;
  for (const filter of filters) {
    const raw = filterValues[filter.key] ?? INTEGRATED_SEARCH_FILTER_ALL_VALUE;
    if (raw === INTEGRATED_SEARCH_FILTER_ALL_VALUE) {
      continue;
    }
    if (filter.multiple) {
      total += decodeIntegratedFilterIds(raw).length;
    } else {
      total += 1;
    }
  }
  return total;
};

const buildInlineSelectionChips = (
  filters: readonly IntegratedSearchFilterConfig[],
  filterValues: Record<string, string>,
): ActiveIntegratedFilterChip[] =>
  filters.flatMap((filter) => {
    const raw = filterValues[filter.key] ?? INTEGRATED_SEARCH_FILTER_ALL_VALUE;
    if (raw === INTEGRATED_SEARCH_FILTER_ALL_VALUE) {
      return [];
    }

    if (filter.multiple) {
      return decodeIntegratedFilterIds(raw).map((id) => {
        const option = filter.options.find((item) => item.value === id);
        return {
          key: encodeIntegratedFilterChipKey(filter.key, id),
          label: `${filter.label}: ${option?.label ?? id}`,
        };
      });
    }

    const option = filter.options.find((item) => item.value === raw);
    return [{ key: filter.key, label: `${filter.label}: ${option?.label ?? raw}` }];
  });

/**
 * Active filter chips for the integrated search bar (non-baseline values only).
 * Up to {@link INTEGRATED_SEARCH_INLINE_SELECTION_LIMIT} selections render individually;
 * beyond that, a single total-count chip is shown.
 */
export const buildActiveIntegratedFilterChips = (
  filters: readonly IntegratedSearchFilterConfig[] | undefined,
  filterValues: Record<string, string>,
  options: BuildActiveIntegratedFilterChipsOptions = {},
): ActiveIntegratedFilterChip[] => {
  if (!filters?.length) {
    return [];
  }

  const total = countActiveSelections(filters, filterValues);
  if (total === 0) {
    return [];
  }

  if (total > INTEGRATED_SEARCH_INLINE_SELECTION_LIMIT) {
    const label = options.summaryCountLabel?.(total) ?? String(total);
    return [{ key: INTEGRATED_SEARCH_FILTER_SUMMARY_CHIP_KEY, label }];
  }

  return buildInlineSelectionChips(filters, filterValues);
};

/**
 * Removes one chip selection from filter values (single value or one id in a multi filter).
 */
export const removeIntegratedFilterChip = (
  filters: readonly IntegratedSearchFilterConfig[] | undefined,
  filterValues: Record<string, string>,
  chipKey: string,
): Record<string, string> | null => {
  if (!filters?.length) {
    return null;
  }

  if (chipKey === INTEGRATED_SEARCH_FILTER_SUMMARY_CHIP_KEY) {
    const cleared: Record<string, string> = {};
    filters.forEach((filter) => {
      cleared[filter.key] = INTEGRATED_SEARCH_FILTER_ALL_VALUE;
    });
    return cleared;
  }

  const parsed = parseIntegratedFilterChipKey(chipKey);
  if (!parsed) {
    return { ...filterValues, [chipKey]: INTEGRATED_SEARCH_FILTER_ALL_VALUE };
  }

  const { filterKey, valueId } = parsed;
  const filter = filters.find((item) => item.key === filterKey);
  if (!filter || !valueId) {
    return { ...filterValues, [filterKey]: INTEGRATED_SEARCH_FILTER_ALL_VALUE };
  }

  const nextIds = decodeIntegratedFilterIds(filterValues[filterKey]).filter((id) => id !== valueId);
  return {
    ...filterValues,
    [filterKey]: encodeIntegratedFilterIds(nextIds),
  };
};
