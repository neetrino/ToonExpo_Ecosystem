import { INTEGRATED_SEARCH_FILTER_CHIP_KEY_SEPARATOR } from '@/shared/ui/integrated-search-filters.constants';

export type IntegratedSearchFilterOption = {
  value: string;
  label: string;
};

export type IntegratedSearchFilterConfig = {
  key: string;
  label: string;
  options: readonly IntegratedSearchFilterOption[];
  /** Label for the empty / “all” baseline option. */
  allOptionLabel: string;
  /** Combobox: type in the field to filter options. */
  searchable?: boolean | undefined;
  /** Allow selecting multiple option values (comma-encoded in filterValues). */
  multiple?: boolean | undefined;
  /** Label when multiple values are selected (e.g. “{count} selected”). */
  selectedCountLabel?: ((count: number) => string) | undefined;
  /** When this filter changes, draft values for these keys reset to “all”. */
  resetsKeys?: readonly string[] | undefined;
  /** Dependent cascade: field is not interactive until parent filter is set. */
  disabled?: boolean | undefined;
  /** Trigger text while disabled (e.g. “Select a building first”). */
  disabledPlaceholder?: string | undefined;
};

export type ActiveIntegratedFilterChip = {
  key: string;
  label: string;
};

/** Encode multi-select ids for URL / integrated search filterValues. */
export const encodeIntegratedFilterIds = (ids: readonly string[]): string =>
  ids.filter((id) => id.trim().length > 0).join(',');

/** Decode comma-separated filter values (empty / blank → no filter). */
export const decodeIntegratedFilterIds = (raw: string | undefined | null): string[] => {
  if (!raw?.trim()) {
    return [];
  }
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
};

/** Chip key for one selected value inside a multi-select filter. */
export const encodeIntegratedFilterChipKey = (filterKey: string, valueId: string): string =>
  `${filterKey}${INTEGRATED_SEARCH_FILTER_CHIP_KEY_SEPARATOR}${valueId}`;

/** Parses a multi-value chip key; returns null for plain filter keys. */
export const parseIntegratedFilterChipKey = (
  chipKey: string,
): { filterKey: string; valueId: string } | null => {
  const separatorIndex = chipKey.indexOf(INTEGRATED_SEARCH_FILTER_CHIP_KEY_SEPARATOR);
  if (separatorIndex <= 0) {
    return null;
  }
  return {
    filterKey: chipKey.slice(0, separatorIndex),
    valueId: chipKey.slice(separatorIndex + INTEGRATED_SEARCH_FILTER_CHIP_KEY_SEPARATOR.length),
  };
};
