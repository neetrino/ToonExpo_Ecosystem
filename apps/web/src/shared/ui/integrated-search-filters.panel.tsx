'use client';

import { useTranslations } from 'next-intl';

import {
  INTEGRATED_SEARCH_FILTER_ALL_VALUE,
  INTEGRATED_SEARCH_FILTER_PANEL_GRID,
} from '@/shared/ui/integrated-search-filters.constants';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';
import {
  decodeIntegratedFilterIds,
  encodeIntegratedFilterIds,
} from '@/shared/ui/integrated-search-filters.types';
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
      {filters.map((filter, index) => (
        <FilterField
          key={filter.key}
          filter={filter}
          value={filterValues[filter.key] ?? INTEGRATED_SEARCH_FILTER_ALL_VALUE}
          menuAlign={index > 0 && index === filters.length - 1 ? 'end' : 'start'}
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
  menuAlign: 'start' | 'end';
  onFilterChange: (key: string, value: string) => void;
};

const FilterField = ({ filter, value, menuAlign, onFilterChange }: FilterFieldProps) => {
  const tCommon = useTranslations('Common.integratedSearch');
  const isDisabled = Boolean(filter.disabled);
  const isMultiple = Boolean(filter.multiple);
  const selectedCountLabel =
    filter.selectedCountLabel ?? ((count: number) => tCommon('selectedCount', { count }));

  if (isMultiple) {
    const selectedIds = isDisabled ? [] : decodeIntegratedFilterIds(value);
    return (
      <label className="flex min-w-0 w-full flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {filter.label}
        </span>
        <ListboxSelect
          variant="field"
          size="full"
          className="h-10 w-full min-w-0"
          aria-label={filter.label}
          multiple
          values={selectedIds}
          options={isDisabled ? [] : [...filter.options]}
          searchable={filter.searchable && !isDisabled}
          searchPlaceholder={tCommon('searchPlaceholder')}
          emptyLabel={tCommon('noMatches')}
          placeholder={isDisabled ? filter.disabledPlaceholder : filter.allOptionLabel}
          selectedCountLabel={selectedCountLabel}
          disabled={isDisabled}
          menuAlign={menuAlign}
          menuExactWidth={false}
          onValuesChange={(next) => {
            onFilterChange(filter.key, encodeIntegratedFilterIds(next));
          }}
        />
      </label>
    );
  }

  const options = isDisabled
    ? []
    : [
        { value: INTEGRATED_SEARCH_FILTER_ALL_VALUE, label: filter.allOptionLabel },
        ...filter.options,
      ];

  return (
    <label className="flex min-w-0 w-full flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
        {filter.label}
      </span>
      <ListboxSelect
        variant="field"
        size="full"
        className="h-10 w-full min-w-0"
        aria-label={filter.label}
        value={isDisabled ? INTEGRATED_SEARCH_FILTER_ALL_VALUE : value}
        options={options}
        searchable={filter.searchable && !isDisabled}
        searchPlaceholder={tCommon('searchPlaceholder')}
        emptyLabel={tCommon('noMatches')}
        placeholder={isDisabled ? filter.disabledPlaceholder : undefined}
        disabled={isDisabled}
        menuAlign={menuAlign}
        menuExactWidth={false}
        onChange={(next) => {
          onFilterChange(filter.key, next);
        }}
      />
    </label>
  );
};
