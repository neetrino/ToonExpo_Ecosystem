'use client';

import { Search, X } from 'lucide-react';
import { useRef } from 'react';

import { IntegratedSearchFilterChips } from '@/shared/ui/integrated-search-filters.chips';
import type { ActiveIntegratedFilterChip } from '@/shared/ui/integrated-search-filters.types';
import { cn } from '@/shared/ui/cn';
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

  return (
    <div
      className={cn(
        // Match ViewModeToggle / Button sm height (`h-9`) and radius.
        'flex h-9 w-full min-w-0 cursor-text items-center gap-1.5 rounded-[15px] border border-border bg-surface-elevated px-2.5',
        hasQuery && 'ring-2 ring-brand/30',
        panelOpen && hasFilters && 'ring-2 ring-brand/20',
      )}
      onMouseDown={(event) => {
        /* Open filters on bar click; keep focus on the input. */
        if ((event.target as HTMLElement).closest('button')) {
          return;
        }
        onOpenPanel();
      }}
    >
      <IntegratedSearchFilterChips
        chips={chips}
        onRemove={onRemoveChip}
        removeAriaLabel={removeChipAriaLabel}
      />
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-1.5 size-4 -translate-y-1/2 text-ink-muted"
          aria-hidden
        />
        <Input
          ref={inputRef}
          type="search"
          value={search}
          placeholder={searchPlaceholder}
          aria-label={searchAriaLabel}
          role="searchbox"
          aria-controls={hasFilters ? 'integrated-search-filter-panel' : undefined}
          /* Native search cancel button is suppressed: the bar renders its own clear control. */
          className="h-8 border-0 bg-transparent py-0 pl-7 shadow-none focus-visible:ring-0 [&::-webkit-search-cancel-button]:hidden"
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
      {hasQuery ? (
        <IconButton
          label={clearAllAriaLabel}
          size="sm"
          variant="ghost"
          className="size-7 shrink-0 rounded-[15px]"
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onReset();
          }}
        >
          <X className="size-3.5" aria-hidden />
        </IconButton>
      ) : null}
    </div>
  );
};
