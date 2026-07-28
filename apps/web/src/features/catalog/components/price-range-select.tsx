'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

import { HeroFilterTrigger } from '@/features/catalog/components/hero-filter-trigger';
import { cn } from '@/shared/ui/cn';
import { DropdownPortal } from '@/shared/ui/dropdown-portal';
import { Input } from '@/shared/ui/input';

const GROUP_SEPARATOR = '\u00a0';
const DIGITS_ONLY = /\D/g;

type PriceRangeSelectProps = {
  minPrice: number | null;
  maxPrice: number | null;
  labels: {
    any: string;
    min: string;
    max: string;
    save: string;
    invalidRange: string;
  };
  /** Visible field title inside the mobile block trigger. */
  fieldLabel: string;
  onApply: (minPrice: number | null, maxPrice: number | null) => void;
};

const formatInputValue = (value: string): string =>
  value.replace(DIGITS_ONLY, '').replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATOR);

const toInputValue = (value: number | null): string =>
  value == null ? '' : formatInputValue(String(value));

const toPrice = (value: string): number | null => {
  const digits = value.replace(DIGITS_ONLY, '');
  if (digits.length === 0) {
    return null;
  }
  const parsed = Number(digits);
  return Number.isSafeInteger(parsed) ? parsed : null;
};

const formatRangeLabel = (
  minPrice: number | null,
  maxPrice: number | null,
  anyLabel: string,
): string => {
  if (minPrice == null && maxPrice == null) {
    return anyLabel;
  }
  const min = minPrice == null ? '0' : formatInputValue(String(minPrice));
  const max = maxPrice == null ? '∞' : formatInputValue(String(maxPrice));
  return `${min} – ${max} ֏`;
};

/**
 * Editable AMD price-range dropdown used by the home hero search.
 */
export const PriceRangeSelect = ({
  minPrice,
  maxPrice,
  labels,
  fieldLabel,
  onApply,
}: PriceRangeSelectProps) => {
  const [open, setOpen] = useState(false);
  const [draftMin, setDraftMin] = useState(() => toInputValue(minPrice));
  const [draftMax, setDraftMax] = useState(() => toInputValue(maxPrice));
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isAny = minPrice == null && maxPrice == null;

  useEffect(() => {
    if (!open) {
      return;
    }
    const closeOnOutsideClick = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const applyRange = (): void => {
    const nextMin = toPrice(draftMin);
    const nextMax = toPrice(draftMax);
    if (nextMin != null && nextMax != null && nextMin > nextMax) {
      setError(labels.invalidRange);
      return;
    }
    setError(null);
    onApply(nextMin, nextMax);
    setOpen(false);
  };

  const applyOnEnter = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    applyRange();
  };

  return (
    <div ref={rootRef} className="relative min-w-0 w-full lg:w-auto">
      <HeroFilterTrigger
        ref={buttonRef}
        label={fieldLabel}
        value={formatRangeLabel(minPrice, maxPrice, labels.any)}
        open={open}
        mutedValue={isAny}
        className="lg:min-w-[11rem]"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setDraftMin(toInputValue(minPrice));
          setDraftMax(toInputValue(maxPrice));
          setError(null);
          setOpen((current) => !current);
        }}
      />

      <DropdownPortal open={open} anchorRef={buttonRef} matchWidth>
        <div
          ref={panelRef}
          role="dialog"
          aria-label={labels.save}
          className="w-[20rem] rounded-[12px] border border-header-border bg-surface-elevated p-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-header-muted">{labels.min}</span>
              <Input
                value={draftMin}
                inputMode="numeric"
                placeholder="30 000 000"
                aria-label={labels.min}
                onKeyDown={applyOnEnter}
                onChange={(event) => setDraftMin(formatInputValue(event.target.value))}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-header-muted">{labels.max}</span>
              <Input
                value={draftMax}
                inputMode="numeric"
                placeholder="100 000 000"
                aria-label={labels.max}
                onKeyDown={applyOnEnter}
                onChange={(event) => setDraftMax(formatInputValue(event.target.value))}
              />
            </label>
          </div>
          {error ? <p className="mt-2 text-xs font-medium text-danger">{error}</p> : null}
          <button
            type="button"
            className={cn(
              'mt-4 h-10 w-full rounded-sm bg-brand-deep px-4 text-sm font-semibold text-on-dark',
              'transition-colors hover:bg-brand-deep/90 focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-brand-deep/30',
            )}
            onClick={applyRange}
          >
            {labels.save}
          </button>
        </div>
      </DropdownPortal>
    </div>
  );
};
