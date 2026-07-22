'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/shared/ui/cn';

export type ListboxOption = {
  value: string;
  label: string;
};

type ListboxSelectProps = {
  value: string;
  options: readonly ListboxOption[];
  onChange: (value: string) => void;
  /** Accessible name when the visible field label is separate. */
  'aria-label': string;
  className?: string | undefined;
  name?: string | undefined;
};

/**
 * Custom listbox — soft panel + check, same family as LocaleSwitcher / ma-marie menus.
 * Replaces native select so the open menu is not OS-default.
 */
export const ListboxSelect = ({
  value,
  options,
  onChange,
  'aria-label': ariaLabel,
  className,
  name,
}: ListboxSelectProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
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

  const pick = (next: string): void => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn('relative min-w-0', className)}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        type="button"
        className={cn(
          'flex w-full min-w-0 items-center justify-between gap-2 bg-transparent p-0 text-left',
          'text-sm font-medium text-ink-navy',
          'transition-colors duration-[var(--duration-fast)]',
          'hover:text-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
        )}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-header-muted transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-premium)]',
            open && 'rotate-180 text-brand-deep',
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            'absolute top-[calc(100%+0.55rem)] left-0 z-[var(--z-dropdown)] min-w-full overflow-hidden',
            'rounded-[12px] border border-header-border bg-surface-elevated py-1.5 shadow-md',
            'animate-[locale-dropdown-in_var(--duration-base)_var(--ease-out-premium)]',
          )}
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm whitespace-nowrap',
                    'transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-premium)]',
                    active
                      ? 'bg-brand-soft font-semibold text-brand-deep'
                      : 'font-medium text-ink hover:bg-surface',
                  )}
                  onClick={() => pick(option.value)}
                >
                  <span>{option.label}</span>
                  {active ? (
                    <Check className="size-3.5 shrink-0 text-brand-logo" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};
