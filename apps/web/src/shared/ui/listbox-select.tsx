'use client';

import { Check, ChevronDown } from 'lucide-react';
import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type FocusEventHandler,
} from 'react';

import { cn } from '@/shared/ui/cn';
import { DropdownPortal } from '@/shared/ui/dropdown-portal';

export type ListboxOption = {
  value: string;
  label: string;
};

export type ListboxSelectProps = {
  value: string;
  options: readonly ListboxOption[];
  onChange: (value: string) => void;
  /** Accessible name when the visible field label is separate. */
  'aria-label': string;
  className?: string | undefined;
  name?: string | undefined;
  id?: string | undefined;
  disabled?: boolean | undefined;
  /** `plain` = hero search; `field` = bordered form control. Menu chrome matches home. */
  variant?: 'plain' | 'field' | undefined;
  /** `full` stretches; `fit` hugs the selected label width. */
  size?: 'full' | 'fit' | undefined;
  onBlur?: FocusEventHandler<HTMLButtonElement> | undefined;
};

/**
 * Custom listbox — soft panel + check, same family as LocaleSwitcher / ma-marie menus.
 * Menu portals to `document.body` so it stacks above page chrome.
 */
export const ListboxSelect = forwardRef<HTMLButtonElement, ListboxSelectProps>(
  function ListboxSelect(
    {
      value,
      options,
      onChange,
      'aria-label': ariaLabel,
      className,
      name,
      id,
      disabled = false,
      variant = 'plain',
      size = 'full',
      onBlur,
    },
    ref,
  ) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLUListElement>(null);
    const listId = useId();
    const isField = variant === 'field';
    const isFit = size === 'fit';
    const selected = options.find((option) => option.value === value) ?? options[0];

    useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement);

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

    const pick = (next: string): void => {
      if (disabled) {
        return;
      }
      onChange(next);
      setOpen(false);
    };

    return (
      <div
        ref={rootRef}
        className={cn(
          'relative min-w-0',
          isField && (isFit ? 'w-fit max-w-full' : 'w-full'),
          !isField && className,
        )}
      >
        {name ? <input type="hidden" name={name} value={value} disabled={disabled} /> : null}
        <button
          ref={buttonRef}
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            'flex min-w-0 items-center justify-between gap-2 text-left',
            isFit ? 'w-auto' : 'w-full',
            'transition-colors duration-[var(--duration-fast)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
            'disabled:cursor-not-allowed disabled:opacity-50',
            isField
              ? cn(
                  'h-11 rounded-sm border border-border bg-surface-elevated px-4',
                  'text-base text-ink sm:text-sm',
                  'transition-[border-color,box-shadow,background-color] duration-[var(--duration-fast)]',
                  'hover:border-border-strong focus-visible:border-brand focus-visible:ring-brand/20',
                  className,
                )
              : cn('bg-transparent p-0 text-sm font-medium text-ink-navy', 'hover:text-brand-deep'),
            !isField && open && 'text-brand-deep',
          )}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onBlur={onBlur}
          onClick={() => {
            if (disabled) {
              return;
            }
            setOpen((current) => !current);
          }}
        >
          <span className={cn(isFit ? 'whitespace-nowrap' : 'truncate')}>{selected?.label}</span>
          <ChevronDown
            className={cn(
              'size-4 shrink-0 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-premium)]',
              isField ? 'text-brand' : 'text-header-muted',
              open && 'rotate-180',
              open && !isField && 'text-brand-deep',
            )}
            aria-hidden
          />
        </button>

        <DropdownPortal open={open && !disabled} anchorRef={buttonRef} matchWidth>
          <ul
            ref={menuRef}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            className={cn(
              'w-max max-w-[min(100vw-2rem,24rem)] overflow-hidden',
              'rounded-[12px] border border-header-border bg-surface-elevated py-1.5 shadow-md',
              'animate-[locale-dropdown-in_var(--duration-base)_var(--ease-out-premium)]',
            )}
          >
            {options.map((option) => {
              const active = option.value === value;
              return (
                <li key={option.value} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
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
        </DropdownPortal>
      </div>
    );
  },
);
