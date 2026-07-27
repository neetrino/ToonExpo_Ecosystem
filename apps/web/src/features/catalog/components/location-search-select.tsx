'use client';

import { Check, Search } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { HeroFilterTrigger } from '@/features/catalog/components/hero-filter-trigger';
import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
import { cn } from '@/shared/ui/cn';
import { DropdownPortal } from '@/shared/ui/dropdown-portal';

type LocationSearchSelectProps = {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  labels: {
    any: string;
    placeholder: string;
    search: string;
    empty: string;
  };
  /** Visible field title inside the mobile block trigger. */
  fieldLabel: string;
  'aria-label': string;
};

const normalize = (value: string): string => value.trim().toLocaleLowerCase();

/**
 * Hero location picker — searchable single-select over catalog cities.
 */
export const LocationSearchSelect = ({
  value,
  options,
  onChange,
  labels,
  fieldLabel,
  'aria-label': ariaLabel,
}: LocationSearchSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();

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

  const pick = (next: string): void => {
    onChange(next);
    setQuery('');
    setOpen(false);
  };

  const displayLabel = value.length > 0 ? value : labels.placeholder;

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      <HeroFilterTrigger
        ref={buttonRef}
        label={fieldLabel}
        value={displayLabel}
        open={open}
        mutedValue={value.length === 0}
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
        <div
          ref={panelRef}
          className={cn(
            'w-full overflow-hidden',
            'rounded-[12px] border border-header-border bg-surface-elevated shadow-md',
            'animate-[locale-dropdown-in_var(--duration-base)_var(--ease-out-premium)]',
          )}
        >
          <div className="border-b border-header-border p-2">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
                aria-hidden
              />
              <input
                ref={searchRef}
                type="search"
                value={query}
                placeholder={labels.search}
                aria-label={labels.search}
                className={cn(
                  'h-10 w-full rounded-sm border border-border bg-surface-elevated pl-9 pr-3',
                  'text-sm text-ink outline-none placeholder:text-ink-muted',
                  'focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20',
                )}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    const first = filtered[0];
                    if (first) {
                      pick(first);
                    }
                  }
                }}
              />
            </div>
          </div>

          <ul
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            className="luxury-scrollbar max-h-56 overflow-y-auto py-1.5"
          >
            <li role="none">
              <button
                type="button"
                role="option"
                aria-selected={value.length === 0}
                className={cn(
                  'flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm',
                  value.length === 0
                    ? 'bg-brand-soft font-semibold text-brand-deep'
                    : 'font-medium text-ink hover:bg-surface',
                )}
                onClick={() => pick('')}
              >
                <span>{labels.any}</span>
                {value.length === 0 ? (
                  <Check className="size-3.5 shrink-0 text-brand-logo" aria-hidden />
                ) : null}
              </button>
            </li>
            {filtered.map((option) => {
              const active = option === value;
              return (
                <li key={option} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm',
                      active
                        ? 'bg-brand-soft font-semibold text-brand-deep'
                        : 'font-medium text-ink hover:bg-surface',
                    )}
                    onClick={() => pick(option)}
                  >
                    <span className="truncate">{option}</span>
                    {active ? (
                      <Check className="size-3.5 shrink-0 text-brand-logo" aria-hidden />
                    ) : null}
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-ink-muted">{labels.empty}</li>
            ) : null}
          </ul>
        </div>
      </DropdownPortal>
    </div>
  );
};
