'use client';

import type { RefObject } from 'react';

import {
  HERO_FILTER_OPTION_BASE_CLASS,
  HERO_FILTER_PANEL_CLASS,
  heroFilterOptionStateClass,
} from '@/features/catalog/components/hero-filter-menu-styles';
import { cn } from '@/shared/ui/cn';
import { DropdownPortal } from '@/shared/ui/dropdown-portal';
import type { ListboxOption } from '@/shared/ui/listbox-select';
import { SelectionMark } from '@/shared/ui/multi-listbox-selection-mark';

type MultiListboxMenuProps = {
  open: boolean;
  disabled: boolean;
  useHeroBlock: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  menuRef: RefObject<HTMLDivElement | null>;
  listId: string;
  ariaLabel: string;
  isAll: boolean;
  allLabel: string;
  options: readonly ListboxOption[];
  values: readonly string[];
  onToggleAll: () => void;
  onToggleOption: (value: string) => void;
};

/**
 * Portal listbox menu for MultiListboxSelect.
 * Stays open while toggling so several options can be picked at once.
 */
export const MultiListboxMenu = ({
  open,
  disabled,
  useHeroBlock,
  anchorRef,
  menuRef,
  listId,
  ariaLabel,
  isAll,
  allLabel,
  options,
  values,
  onToggleAll,
  onToggleOption,
}: MultiListboxMenuProps) => (
  <DropdownPortal
    open={open && !disabled}
    anchorRef={anchorRef}
    exactWidth={useHeroBlock}
    matchWidth={!useHeroBlock}
  >
    <div
      ref={menuRef}
      className={
        useHeroBlock
          ? HERO_FILTER_PANEL_CLASS
          : 'w-full overflow-hidden rounded-[16px] border border-header-border bg-surface-elevated shadow-lg'
      }
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
              onToggleAll();
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
                  onToggleOption(option.value);
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
);
