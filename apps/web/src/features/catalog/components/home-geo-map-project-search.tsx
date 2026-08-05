'use client';

import { Search } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';

import { HOME_GEO_MAP_SEARCH_MAX_RESULTS } from '@/features/catalog/constants/home-geo-map';
import type { GeoMapObject } from '@/features/geo-map/types';
import { filterMapObjectsByLabel } from '@/features/geo-map/utils/filter-map-objects-by-label';
import { cn } from '@/shared/ui/cn';
import { Input } from '@/shared/ui/input';

/** Delay before closing the listbox on blur so option mousedown/click can fire. */
const SEARCH_BLUR_CLOSE_DELAY_MS = 120;

type HomeGeoMapProjectSearchProps = {
  objects: readonly GeoMapObject[];
  onSelect: (object: GeoMapObject) => void;
  className?: string | undefined;
};

type SearchResultsListProps = {
  listboxId: string;
  results: readonly GeoMapObject[];
  activeIndex: number;
  showEmpty: boolean;
  emptyLabel: string;
  listLabel: string;
  onActiveIndexChange: (index: number) => void;
  onSelectIndex: (index: number) => void;
};

const SearchResultsList = ({
  listboxId,
  results,
  activeIndex,
  showEmpty,
  emptyLabel,
  listLabel,
  onActiveIndexChange,
  onSelectIndex,
}: SearchResultsListProps) => (
  <ul
    id={listboxId}
    role="listbox"
    aria-label={listLabel}
    className={cn(
      'absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-y-auto',
      'rounded-[12px] bg-surface-elevated py-1 shadow-lg ring-1 ring-header-border',
    )}
  >
    {showEmpty ? (
      <li className="px-4 py-3 text-sm text-header-muted">{emptyLabel}</li>
    ) : (
      results.map((object, index) => {
        const isActive = index === activeIndex;
        return (
          <li
            key={object.id}
            id={`${listboxId}-option-${object.id}`}
            role="option"
            aria-selected={isActive}
          >
            <button
              type="button"
              tabIndex={-1}
              className={cn(
                'flex w-full px-4 py-2.5 text-left text-sm transition-colors',
                isActive
                  ? 'bg-brand-soft/50 font-medium text-brand-deep'
                  : 'text-ink-navy hover:bg-brand-soft/30',
              )}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => onActiveIndexChange(index)}
              onClick={() => onSelectIndex(index)}
            >
              {object.label}
            </button>
          </li>
        );
      })
    )}
  </ul>
);

/**
 * Client-side project name search over loaded geo-map models.
 * Keyboard: ArrowUp/Down, Enter to select, Escape to close.
 */
export const HomeGeoMapProjectSearch = ({
  objects,
  onSelect,
  className,
}: HomeGeoMapProjectSearchProps) => {
  const t = useTranslations('HomePage.developments.search');
  const listboxId = useId();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const blurCloseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (blurCloseTimerRef.current !== null) {
        window.clearTimeout(blurCloseTimerRef.current);
      }
    };
  }, []);

  const results = useMemo(() => {
    const matched = filterMapObjectsByLabel(objects, query);
    return matched.slice(0, HOME_GEO_MAP_SEARCH_MAX_RESULTS);
  }, [objects, query]);

  const showPanel = isOpen && query.trim().length > 0;
  const showEmpty = showPanel && results.length === 0;
  const activeOptionId =
    showPanel && results[activeIndex]
      ? `${listboxId}-option-${results[activeIndex].id}`
      : undefined;

  const selectAt = (index: number): void => {
    const object = results[index];
    if (!object) {
      return;
    }
    onSelect(object);
    setQuery(object.label);
    setIsOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!showPanel && query.trim().length > 0) {
        setIsOpen(true);
        return;
      }
      setActiveIndex((prev) => Math.min(prev + 1, Math.max(results.length - 1, 0)));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (event.key === 'Enter' && showPanel) {
      event.preventDefault();
      selectAt(activeIndex);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('relative w-full max-w-md', className)}>
      <div className="relative min-w-0">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
        />
        <Input
          type="search"
          role="combobox"
          value={query}
          placeholder={t('placeholder')}
          aria-label={t('label')}
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          autoComplete="off"
          className="h-10 w-full bg-surface-elevated pl-9 shadow-md ring-1 ring-header-border"
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => {
            if (query.trim().length > 0) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            // Delay so option clicks register before the panel closes.
            if (blurCloseTimerRef.current !== null) {
              window.clearTimeout(blurCloseTimerRef.current);
            }
            blurCloseTimerRef.current = window.setTimeout(() => {
              blurCloseTimerRef.current = null;
              setIsOpen(false);
            }, SEARCH_BLUR_CLOSE_DELAY_MS);
          }}
          onKeyDown={onKeyDown}
        />
      </div>

      {showPanel ? (
        <SearchResultsList
          listboxId={listboxId}
          results={results}
          activeIndex={activeIndex}
          showEmpty={showEmpty}
          emptyLabel={t('empty')}
          listLabel={t('label')}
          onActiveIndexChange={setActiveIndex}
          onSelectIndex={selectAt}
        />
      ) : null}
    </div>
  );
};
