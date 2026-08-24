'use client';

import { Search, X } from 'lucide-react';
import { useRef } from 'react';

import { IntegratedSearchFilterChips } from '@/shared/ui/integrated-search-filters.chips';
import type { ActiveIntegratedFilterChip } from '@/shared/ui/integrated-search-filters.types';
import { cn } from '@/shared/ui/cn';
import { INTEGRATED_SEARCH_BAR_FIELD_MIN_WIDTH_CLASS } from '@/shared/ui/integrated-search-filters.constants';
import { IconButton } from '@/shared/ui/icon-button';
import { Input } from '@/shared/ui/input';

type IntegratedSearchBarProps = {
  search: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  chips: readonly ActiveIntegratedFilterChip[];
  hasQuery: boolean;
  panelOpen: boolean;
  hasFilters: boolean;
  clearAllAriaLabel: string;
  removeChipAriaLabel: (chipLabel: string) => string;
  onSearchChange: (value: string) => void;
  onOpenPanel: () => void;
  onClosePanel: () => void;
  onRemoveChip: (key: string) => void;
  onReset: () => void;
};

/**
 * Search input chrome with active filter chips and clear control.
 */
export const IntegratedSearchBar = ({
  search,
  searchPlaceholder,
  searchAriaLabel,
  chips,
  hasQuery,
  panelOpen,
  hasFilters,
  clearAllAriaLabel,
  removeChipAriaLabel,
  onSearchChange,
  onOpenPanel,
  onClosePanel,
  onRemoveChip,
  onReset,
}: IntegratedSearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasChips = chips.length > 0;

  const focusSearch = () => {
    inputRef.current?.focus();
    onOpenPanel();
  };

  return (
    <div
      className={cn(
        'flex h-9 w-full min-w-0 items-center gap-1.5 rounded-[15px] border border-border bg-surface-elevated px-2.5',
        hasQuery && 'ring-2 ring-brand/30',
        panelOpen && hasFilters && 'ring-2 ring-brand/20',
      )}
    >
      {hasChips ? (
        <div className="min-w-0 shrink max-md:overflow-x-auto">
          <IntegratedSearchFilterChips
            chips={chips}
            onRemove={onRemoveChip}
            removeAriaLabel={removeChipAriaLabel}
          />
        </div>
      ) : null}
      <div
        className={cn('relative flex flex-1 items-center', INTEGRATED_SEARCH_BAR_FIELD_MIN_WIDTH_CLASS)}
        onMouseDown={(event) => {
          if ((event.target as HTMLElement).closest('button')) {
            return;
          }
          onOpenPanel();
        }}
      >
        <Input
          ref={inputRef}
          type="search"
          value={search}
          placeholder={hasChips ? undefined : searchPlaceholder}
          aria-label={searchAriaLabel}
          role="searchbox"
          aria-controls={hasFilters ? 'integrated-search-filter-panel' : undefined}
          className={cn(
            'h-8 w-full border-0 bg-transparent px-1 py-0 shadow-none focus-visible:ring-0 [&::-webkit-search-cancel-button]:hidden',
            INTEGRATED_SEARCH_BAR_FIELD_MIN_WIDTH_CLASS,
          )}
          onChange={(event) => {
            onSearchChange(event.target.value);
            if (event.target.value.length > 0) {
              onClosePanel();
            }
          }}
          onFocus={onOpenPanel}
          onClick={onOpenPanel}
        />
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <IconButton
          label={searchAriaLabel}
          size="sm"
          variant="ghost"
          className="size-7 shrink-0 rounded-[15px]"
          onPointerDown={(event) => {
            event.preventDefault();
            focusSearch();
          }}
        >
          <Search className="size-3.5 text-ink-muted" aria-hidden />
        </IconButton>
        {hasQuery ? (
          <IconButton
            label={clearAllAriaLabel}
            size="sm"
            variant="ghost"
            className="size-7 shrink-0 rounded-[15px]"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onReset();
            }}
          >
            <X className="size-3.5" aria-hidden />
          </IconButton>
        ) : null}
      </div>
    </div>
  );
};
