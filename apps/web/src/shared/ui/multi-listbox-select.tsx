'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/shared/ui/cn';
import { DropdownPortal } from '@/shared/ui/dropdown-portal';
import type { ListboxOption } from '@/shared/ui/listbox-select';

type MultiListboxSelectProps = {
  /** Empty array = All (no filter). */
  values: readonly string[];
  options: readonly ListboxOption[];
  onChange: (values: string[]) => void;
  allLabel: string;
  selectedCountLabel: (count: number) => string;
  'aria-label': string;
  className?: string | undefined;
  id?: string | undefined;
  disabled?: boolean | undefined;
};

/**
 * Multi-select listbox — empty selection means "All".
 */
export const MultiListboxSelect = ({
  values,
  options,
  onChange,
  allLabel,
  selectedCountLabel,
  'aria-label': ariaLabel,
  className,
  id,
  disabled = false,
}: MultiListboxSelectProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const isAll = values.length === 0;

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setOpen(false);
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
    if (isAll) {
      return allLabel;
    }
    if (values.length === 1) {
      return options.find((option) => option.value === values[0])?.label ?? selectedCountLabel(1);
    }
    return selectedCountLabel(values.length);
  })();

  const toggleAll = (): void => {
    onChange([]);
  };

  const toggleOption = (value: string): void => {
    if (isAll) {
      onChange([value]);
      return;
    }
    if (values.includes(value)) {
      const next = values.filter((item) => item !== value);
      onChange(next);
      return;
    }
    const next = [...values, value];
    if (next.length >= options.length) {
      onChange([]);
      return;
    }
    onChange(next);
  };

  return (
    <div ref={rootRef} className={cn('relative w-full min-w-0', className)}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-sm border border-border',
          'bg-surface-elevated px-4 text-left text-base text-ink sm:text-sm',
          'transition-[border-color,box-shadow,background-color] duration-[var(--duration-fast)]',
          'hover:border-border-strong focus-visible:border-brand focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-brand/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (disabled) {
            return;
          }
          setOpen((current) => !current);
        }}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-brand transition-transform duration-[var(--duration-base)]',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      <DropdownPortal open={open && !disabled} anchorRef={buttonRef} matchWidth>
        <ul
          ref={menuRef}
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          aria-label={ariaLabel}
          className={cn(
            'max-h-64 w-full overflow-y-auto',
            'rounded-[12px] border border-header-border bg-surface-elevated py-1.5 shadow-md',
            'animate-[locale-dropdown-in_var(--duration-base)_var(--ease-out-premium)]',
          )}
        >
          <li role="none">
            <button
              type="button"
              role="option"
              aria-selected={isAll}
              className={cn(
                'flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm',
                'transition-colors duration-[var(--duration-base)]',
                isAll
                  ? 'bg-brand-soft font-semibold text-brand-deep'
                  : 'font-medium text-ink hover:bg-surface',
              )}
              onClick={toggleAll}
            >
              <span>{allLabel}</span>
              {isAll ? <Check className="size-3.5 shrink-0 text-brand-logo" aria-hidden /> : null}
            </button>
          </li>
          {options.map((option) => {
            const active = !isAll && values.includes(option.value);
            return (
              <li key={option.value} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm',
                    'transition-colors duration-[var(--duration-base)]',
                    active
                      ? 'bg-brand-soft font-semibold text-brand-deep'
                      : 'font-medium text-ink hover:bg-surface',
                  )}
                  onClick={() => {
                    toggleOption(option.value);
                  }}
                >
                  <span className="truncate">{option.label}</span>
                  {active ? (
                    <Check className="size-3.5 shrink-0 text-brand-logo" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </DropdownPortal>
    </div>
  );
};
