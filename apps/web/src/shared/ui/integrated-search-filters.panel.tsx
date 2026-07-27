'use client';

import {
  INTEGRATED_SEARCH_FILTER_ALL_VALUE,
  INTEGRATED_SEARCH_FILTER_PANEL_GRID,
} from '@/shared/ui/integrated-search-filters.constants';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';
import { Button } from '@/shared/ui/button';
import { ListboxSelect } from '@/shared/ui/listbox-select';

type IntegratedSearchFilterPanelProps = {
  filters: readonly IntegratedSearchFilterConfig[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onApply: () => void;
  onReset: () => void;
  applyLabel: string;
  resetLabel: string;
};

/**
 * Dropdown panel with filter selects + Apply / Reset (NBOS IntegratedSearchFilters).
 */
export const IntegratedSearchFilterPanel = ({
  filters,
  filterValues,
  onFilterChange,
  onApply,
  onReset,
  applyLabel,
  resetLabel,
}: IntegratedSearchFilterPanelProps) => (
  <div className="flex flex-col gap-4">
    <div className={INTEGRATED_SEARCH_FILTER_PANEL_GRID}>
      {filters.map((filter) => (
        <FilterField
          key={filter.key}
          filter={filter}
          value={filterValues[filter.key] ?? INTEGRATED_SEARCH_FILTER_ALL_VALUE}
          onFilterChange={onFilterChange}
        />
      ))}
    </div>
    <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
      <Button type="button" variant="ghost" size="sm" onClick={onReset}>
        {resetLabel}
      </Button>
      <Button type="button" size="sm" onClick={onApply}>
        {applyLabel}
      </Button>
    </div>
  </div>
);

type FilterFieldProps = {
  filter: IntegratedSearchFilterConfig;
  value: string;
  onFilterChange: (key: string, value: string) => void;
};

const FilterField = ({ filter, value, onFilterChange }: FilterFieldProps) => {
  const options = [
    { value: INTEGRATED_SEARCH_FILTER_ALL_VALUE, label: filter.allOptionLabel },
    ...filter.options,
  ];

  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
        {filter.label}
      </span>
      <ListboxSelect
        variant="field"
        size="full"
        className="h-10"
        aria-label={filter.label}
        value={value}
        options={options}
        onChange={(next) => {
          onFilterChange(filter.key, next);
        }}
      />
    </label>
  );
};
