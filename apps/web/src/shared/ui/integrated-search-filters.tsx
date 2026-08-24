'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';

import { IntegratedSearchBar } from '@/shared/ui/integrated-search-filters.bar';
import { buildActiveIntegratedFilterChips } from '@/shared/ui/integrated-search-filters.build-chips';
import {
  INTEGRATED_SEARCH_FILTER_ALL_VALUE,
  INTEGRATED_SEARCH_FILTER_PANEL_SURFACE,
} from '@/shared/ui/integrated-search-filters.constants';
import { IntegratedSearchFilterPanel } from '@/shared/ui/integrated-search-filters.panel';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';
import { cn } from '@/shared/ui/cn';
import { DropdownPortal } from '@/shared/ui/dropdown-portal';

const EMPTY_FILTER_VALUES: Record<string, string> = {};

export type IntegratedSearchFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchAriaLabel: string;
  filters?: readonly IntegratedSearchFilterConfig[] | undefined;
  filterValues?: Record<string, string> | undefined;
  onFilterChange?: ((key: string, value: string) => void) | undefined;
  /** Prefer over per-key onFilterChange when Apply commits several filters at once. */
  onApplyFilters?: ((draftFilters: Record<string, string>) => void) | undefined;
  /** Fires while the panel is open whenever draft filter values change. */
  onDraftFilterChange?: ((draftFilters: Record<string, string>) => void) | undefined;
  /** Fires when the filter panel opens or closes. */
  onPanelOpenChange?: ((open: boolean) => void) | undefined;
  onClearAll?: (() => void) | undefined;
  applyLabel: string;
  resetLabel: string;
  clearAllAriaLabel: string;
  panelAriaLabel: string;
  removeChipAriaLabel: (chipLabel: string) => string;
  /** Panel horizontal anchor when search sits on the right. */
  panelAlign?: 'start' | 'end' | undefined;
  className?: string | undefined;
};

/**
 * Search bar with filters inside — chips + focus panel (NBOS IntegratedSearchFilters pattern).
 */
export const IntegratedSearchFilters = ({
  search,
  onSearchChange,
  searchPlaceholder,
  searchAriaLabel,
  filters,
  filterValues = EMPTY_FILTER_VALUES,
  onFilterChange,
  onApplyFilters,
  onDraftFilterChange,
  onPanelOpenChange,
  onClearAll,
  applyLabel,
  resetLabel,
  clearAllAriaLabel,
  panelAriaLabel,
  removeChipAriaLabel,
  panelAlign = 'start',
  className,
}: IntegratedSearchFiltersProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(filterValues);
  const [optimisticFilterValues, setOptimisticFilterValues] = useState<Record<
    string,
    string
  > | null>(null);
  const hasFilters = Boolean(filters?.length);
  const displayedFilterValues = optimisticFilterValues ?? filterValues;
  const chips = useMemo(
    () => buildActiveIntegratedFilterChips(filters, displayedFilterValues),
    [filters, displayedFilterValues],
  );
  const hasQuery = search.trim().length > 0 || chips.length > 0;

  useEffect(() => {
    if (!optimisticFilterValues) {
      return;
    }
    const allCleared = filters?.every(
      (filter) =>
        (filterValues[filter.key] ?? INTEGRATED_SEARCH_FILTER_ALL_VALUE) ===
        INTEGRATED_SEARCH_FILTER_ALL_VALUE,
    );
    if (allCleared) {
      setOptimisticFilterValues(null);
    }
  }, [filterValues, filters, optimisticFilterValues]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    onPanelOpenChange?.(false);
  }, [onPanelOpenChange]);

  useOutsideClose(panelOpen, containerRef, closePanel);

  const handleReset = () => {
    const cleared: Record<string, string> = {};
    filters?.forEach((filter) => {
      cleared[filter.key] = INTEGRATED_SEARCH_FILTER_ALL_VALUE;
    });
    setOptimisticFilterValues(cleared);
    setDraftFilters(cleared);
    onDraftFilterChange?.(cleared);
    onSearchChange('');
    closePanel();
    if (onClearAll) {
      onClearAll();
    } else if (onApplyFilters) {
      onApplyFilters(cleared);
    } else {
      filters?.forEach((filter) => {
        onFilterChange?.(filter.key, INTEGRATED_SEARCH_FILTER_ALL_VALUE);
      });
    }
  };

  const openPanel = () => {
    if (!hasFilters) {
      return;
    }
    setDraftFilters(filterValues);
    onDraftFilterChange?.(filterValues);
    onPanelOpenChange?.(true);
    setPanelOpen(true);
  };

  return (
    <div ref={containerRef} className={cn('relative w-full min-w-0', className)}>
      <IntegratedSearchBar
        search={search}
        searchPlaceholder={searchPlaceholder}
        searchAriaLabel={searchAriaLabel}
        chips={chips}
        hasQuery={hasQuery}
        panelOpen={panelOpen}
        hasFilters={hasFilters}
        clearAllAriaLabel={clearAllAriaLabel}
        removeChipAriaLabel={removeChipAriaLabel}
        onSearchChange={onSearchChange}
        onOpenPanel={openPanel}
        onClosePanel={closePanel}
        onRemoveChip={(key) => {
          onFilterChange?.(key, INTEGRATED_SEARCH_FILTER_ALL_VALUE);
        }}
        onReset={handleReset}
      />
      <DropdownPortal open={hasFilters && panelOpen} anchorRef={containerRef} align={panelAlign}>
        <div
          id="integrated-search-filter-panel"
          role="dialog"
          aria-label={panelAriaLabel}
          className={INTEGRATED_SEARCH_FILTER_PANEL_SURFACE}
        >
          <IntegratedSearchFilterPanel
            filters={filters ?? []}
            filterValues={draftFilters}
            onFilterChange={(key, value) => {
              const next = applyDraftFilterChange(filters, draftFilters, key, value);
              setDraftFilters(next);
              onDraftFilterChange?.(next);
            }}
            onApply={() => {
              if (onApplyFilters) {
                onApplyFilters(draftFilters);
              } else {
                applyDraftFilters(filters, draftFilters, filterValues, onFilterChange);
              }
              closePanel();
            }}
            onReset={handleReset}
            applyLabel={applyLabel}
            resetLabel={resetLabel}
          />
        </div>
      </DropdownPortal>
    </div>
  );
};

const applyDraftFilterChange = (
  filters: readonly IntegratedSearchFilterConfig[] | undefined,
  prev: Record<string, string>,
  key: string,
  value: string,
): Record<string, string> => {
  const next = { ...prev, [key]: value };
  const config = filters?.find((filter) => filter.key === key);
  config?.resetsKeys?.forEach((resetKey) => {
    next[resetKey] = INTEGRATED_SEARCH_FILTER_ALL_VALUE;
  });
  return next;
};

const applyDraftFilters = (
  filters: readonly IntegratedSearchFilterConfig[] | undefined,
  draftFilters: Record<string, string>,
  filterValues: Record<string, string>,
  onFilterChange: ((key: string, value: string) => void) | undefined,
): void => {
  if (!onFilterChange || !filters) {
    return;
  }
  for (const filter of filters) {
    const next = draftFilters[filter.key];
    if (next !== undefined && next !== filterValues[filter.key]) {
      onFilterChange(filter.key, next);
    }
  }
};

const useOutsideClose = (
  open: boolean,
  containerRef: RefObject<HTMLDivElement | null>,
  closePanel: () => void,
): void => {
  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      if (containerRef.current?.contains(target)) {
        return;
      }
      if (target.closest('[data-dropdown-portal]')) {
        return;
      }
      closePanel();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePanel();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, containerRef, closePanel]);
};
