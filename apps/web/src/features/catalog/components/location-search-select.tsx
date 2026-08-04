'use client';

import { Check, Search } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { HeroFilterTrigger } from '@/features/catalog/components/hero-filter-trigger';
import {
  HERO_FILTER_CHECK_CLASS,
  HERO_FILTER_OPTION_BASE_CLASS,
  HERO_FILTER_PANEL_CLASS,
  HERO_FILTER_SEARCH_INPUT_CLASS,
  heroFilterOptionStateClass,
} from '@/features/catalog/components/hero-filter-menu-styles';
import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
import { cn } from '@/shared/ui/cn';
import { DropdownPortal } from '@/shared/ui/dropdown-portal';

type LocationSearchSelectProps = {
  /** Empty array = any location (no city filter). */
  values: readonly string[];
  options: readonly string[];
  onChange: (values: string[]) => void;
  labels: {
    any: string;
    placeholder: string;
    search: string;
    empty: string;
    selectedCount: (count: number) => string;
  };
  /** Visible field title inside the mobile block trigger. */
  fieldLabel: string;
  'aria-label': string;
  /** Section chrome (padding / borders) — root is the portal width anchor. */
  className?: string | undefined;
};

const normalize = (value: string): string => value.trim().toLocaleLowerCase();

const SelectionMark = ({ checked }: { checked: boolean }) => (
  <span
    className={cn(
      HERO_FILTER_CHECK_CLASS.box,
      checked ? HERO_FILTER_CHECK_CLASS.checked : HERO_FILTER_CHECK_CLASS.unchecked,
    )}
    aria-hidden
  >
    {checked ? <Check className="size-3" strokeWidth={3} /> : null}
  </span>
);

/**
 * Hero location picker — searchable multi-select over catalog cities.
 * Empty selection means "Any location". Menu stays open while toggling.
 */
export const LocationSearchSelect = ({
  values,
  options,
  onChange,
  labels,
  fieldLabel,
  'aria-label': ariaLabel,
  className,
}: LocationSearchSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const isAny = values.length === 0;

  const filtered = useMemo(() => {
    const needle = normalize(query);
    if (needle.length === 0) {
      return options;
    }
    return options.filter((option) => normalize(option).includes(needle));
  }, [options, query]);

  useEffect(() => {
    if (!open) {
      return;
    }
    searchRef.current?.focus();

    const onPointerDown = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setOpen(false);
        blurActiveElementAfterEscClose();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const displayLabel = (() => {
    if (isAny) {
      return labels.placeholder;
    }
    if (values.length === 1) {
      return values[0] ?? labels.placeholder;
    }
    if (values.length <= 3) {
      return values.join(', ');
    }
    return labels.selectedCount(values.length);
  })();

  const clearAll = (): void => {
    onChange([]);
  };

  const toggleOption = (option: string): void => {
    if (isAny) {
      onChange(options.filter((item) => item !== option));
      return;
    }
    if (values.includes(option)) {
      onChange(values.filter((item) => item !== option));
      return;
    }
    const next = [...values, option];
    if (next.length >= options.length) {
      onChange([]);
      return;
    }
    onChange(next);
  };

  const toggleFirstFiltered = (): void => {
    const first = filtered[0];
    if (first) {
      toggleOption(first);
    }
  };

  return (
    <div ref={rootRef} className={cn('relative flex w-full min-w-0 flex-col gap-1', className)}>
      <span className="hidden text-[10px] font-bold tracking-[0.1em] text-header-muted uppercase lg:inline">
        {fieldLabel}
      </span>
      <HeroFilterTrigger
        ref={buttonRef}
        label={fieldLabel}
        value={displayLabel}
        open={open}
        mutedValue={isAny}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          setQuery('');
          setOpen((current) => !current);
        }}
      />

      <DropdownPortal open={open} anchorRef={rootRef} exactWidth>
        <div ref={panelRef} className={HERO_FILTER_PANEL_CLASS}>
          <div className="border-b border-header-border bg-canvas/80 p-2.5">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-header-muted"
                aria-hidden
              />
              <input
                ref={searchRef}
                type="search"
                value={query}
                placeholder={labels.search}
                aria-label={labels.search}
                className={HERO_FILTER_SEARCH_INPUT_CLASS}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    toggleFirstFiltered();
                  }
                }}
              />
            </div>
          </div>

          <ul
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            aria-label={ariaLabel}
            className="luxury-scrollbar max-h-56 overflow-y-auto py-1.5"
          >
            <li role="none">
              <button
                type="button"
                role="option"
                aria-selected={isAny}
                className={cn(HERO_FILTER_OPTION_BASE_CLASS, heroFilterOptionStateClass(isAny))}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  clearAll();
                }}
              >
                <SelectionMark checked={isAny} />
                <span className="min-w-0 flex-1 truncate">{labels.any}</span>
              </button>
            </li>
            {filtered.map((option) => {
              const active = isAny || values.includes(option);
              return (
                <li key={option} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={cn(
                      HERO_FILTER_OPTION_BASE_CLASS,
                      heroFilterOptionStateClass(active),
                    )}
                    onMouseDown={(event) => {
                      event.preventDefault();
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleOption(option);
                    }}
                  >
                    <SelectionMark checked={active} />
                    <span className="min-w-0 flex-1 truncate">{option}</span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-header-muted">{labels.empty}</li>
            ) : null}
          </ul>
        </div>
      </DropdownPortal>
    </div>
  );
};
