'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { HeroFilterTrigger } from '@/features/catalog/components/hero-filter-trigger';
import {
  HERO_FILTER_CHECK_CLASS,
  HERO_FILTER_OPTION_BASE_CLASS,
  HERO_FILTER_PANEL_CLASS,
  heroFilterOptionStateClass,
} from '@/features/catalog/components/hero-filter-menu-styles';
import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
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
  /** `plain` = hero search; `field` = bordered form control. */
  variant?: 'plain' | 'field' | undefined;
  /** `full` stretches; `fit` matches content width. */
  size?: 'full' | 'fit' | undefined;
  /**
   * When set with `variant="plain"`, renders the mobile hero filter block
   * (label + value) and collapses to the plain trigger on `lg+`.
   */
  heroBlock?:
    | {
        label: string;
      }
    | undefined;
};

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
 * Multi-select listbox — empty selection means "All".
 * Menu stays open while toggling options so several can be picked at once.
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
  variant = 'field',
  size = 'full',
  heroBlock,
}: MultiListboxSelectProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const isAll = values.length === 0;
  const isField = variant === 'field';
  const isFit = size === 'fit';
  const useHeroBlock = !isField && heroBlock != null;

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      if (target instanceof Element && target.closest('[data-dropdown-portal]')) {
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
    if (isAll) {
      return allLabel;
    }
    if (values.length === 1) {
      return options.find((option) => option.value === values[0])?.label ?? selectedCountLabel(1);
    }
    const labels = values
      .map((value) => options.find((option) => option.value === value)?.label)
      .filter((label): label is string => label != null);
    if (labels.length > 0 && labels.length <= 3) {
      return labels.join(', ');
    }
    return selectedCountLabel(values.length);
  })();

  const toggleAll = (): void => {
    onChange([]);
  };

  const toggleOption = (value: string): void => {
    if (isAll) {
      onChange(options.map((option) => option.value).filter((item) => item !== value));
      return;
    }
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value));
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
    <div
      ref={rootRef}
      className={cn(
        'relative min-w-0',
        isField && (isFit ? 'w-fit max-w-full' : 'w-full'),
        useHeroBlock && 'flex w-full flex-col gap-1',
        !isField && !useHeroBlock && (isFit ? 'w-fit max-w-full' : 'w-full'),
        !isField && className,
      )}
    >
      {isFit && !useHeroBlock ? (
        <ul aria-hidden className="invisible col-start-1 row-start-1 h-0 overflow-hidden">
          <li>
            <span
              className={cn(
                'flex items-center justify-between gap-2 whitespace-nowrap',
                isField ? 'px-4 text-base sm:text-sm' : 'text-sm font-medium',
              )}
            >
              <span>{allLabel}</span>
              <ChevronDown className="size-4 shrink-0" aria-hidden />
            </span>
          </li>
          {options.map((option) => (
            <li key={option.value}>
              <span
                className={cn(
                  'flex items-center justify-between gap-2 whitespace-nowrap',
                  isField ? 'px-4 text-base sm:text-sm' : 'text-sm font-medium',
                )}
              >
                <span>{option.label}</span>
                <ChevronDown className="size-4 shrink-0" aria-hidden />
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {useHeroBlock && heroBlock ? (
        <>
          <span className="hidden text-[10px] font-bold tracking-[0.1em] text-header-muted uppercase lg:inline">
            {heroBlock.label}
          </span>
          <HeroFilterTrigger
            ref={buttonRef}
            id={id}
            label={heroBlock.label}
            value={displayLabel}
            open={open}
            mutedValue={isAll}
            disabled={disabled}
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
          />
        </>
      ) : (
        <button
          ref={buttonRef}
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            'col-start-1 row-start-1 flex min-w-0 items-center justify-between gap-2 text-left',
            'w-full',
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
          onClick={() => {
            if (disabled) {
              return;
            }
            setOpen((current) => !current);
          }}
        >
          <span className={cn(isFit ? 'whitespace-nowrap' : 'truncate')}>{displayLabel}</span>
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
      )}

      <DropdownPortal
        open={open && !disabled}
        anchorRef={useHeroBlock ? rootRef : buttonRef}
        exactWidth={useHeroBlock}
        matchWidth={!useHeroBlock}
      >
        <div
          ref={menuRef}
          className={cn(
            useHeroBlock
              ? HERO_FILTER_PANEL_CLASS
              : 'w-full overflow-hidden rounded-[16px] border border-header-border bg-surface-elevated shadow-lg',
            'animate-[locale-dropdown-in_var(--duration-base)_var(--ease-out-premium)]',
          )}
        >
          <ul
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            aria-label={ariaLabel}
            className="luxury-scrollbar max-h-64 w-full overflow-y-auto py-1.5"
          >
            <li role="none">
              <button
                type="button"
                role="option"
                aria-selected={isAll}
                className={cn(
                  HERO_FILTER_OPTION_BASE_CLASS,
                  useHeroBlock
                    ? heroFilterOptionStateClass(isAll)
                    : isAll
                      ? 'bg-brand-soft font-semibold text-brand-deep'
                      : 'font-medium text-ink hover:bg-surface',
                )}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleAll();
                }}
              >
                <SelectionMark checked={isAll} />
                <span className="min-w-0 flex-1 truncate">{allLabel}</span>
              </button>
            </li>
            {options.map((option) => {
              const active = isAll || values.includes(option.value);
              return (
                <li key={option.value} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={cn(
                      HERO_FILTER_OPTION_BASE_CLASS,
                      useHeroBlock
                        ? heroFilterOptionStateClass(active)
                        : active
                          ? 'bg-brand-soft font-semibold text-brand-deep'
                          : 'font-medium text-ink hover:bg-surface',
                    )}
                    onMouseDown={(event) => {
                      event.preventDefault();
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleOption(option.value);
                    }}
                  >
                    <SelectionMark checked={active} />
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </DropdownPortal>
    </div>
  );
};
