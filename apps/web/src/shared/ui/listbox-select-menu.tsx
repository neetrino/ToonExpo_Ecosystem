'use client';

import { ChevronDown, Search } from 'lucide-react';
import type { FocusEventHandler, ReactNode, RefObject } from 'react';

import { cn } from '@/shared/ui/cn';
import { SelectionMark } from '@/shared/ui/multi-listbox-selection-mark';
import {
  dropdownPanelMotionClass,
  useDropdownEnterExit,
} from '@/shared/ui/use-dropdown-enter-exit';

export type ListboxOption = {
  value: string;
  label: string;
};

type ListboxMenuOptionsProps = {
  listId: string;
  ariaLabel: string;
  options: readonly ListboxOption[];
  selectedIds: readonly string[];
  multiple: boolean;
  optionAction: ((option: ListboxOption) => ReactNode) | undefined;
  menuFooter: ReactNode | undefined;
  onPick: (value: string) => void;
};

type ContainedListboxMenuProps = {
  open: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
};

/**
 * In-sheet listbox panel — same enter/exit motion as portaled dropdowns, no scrim.
 */
export const ContainedListboxMenu = ({
  open,
  menuRef,
  children,
}: ContainedListboxMenuProps) => {
  const { isVisible, isExiting, handleAnimationEnd } = useDropdownEnterExit({ open });

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className={cn(
        'site-select-menu site-select-menu--contained absolute top-[calc(100%+8px)] right-0 left-0 z-20',
        isExiting && 'pointer-events-none',
        dropdownPanelMotionClass('bottom', isExiting, true),
      )}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  );
};

export const ListboxMenuOptions = ({
  listId,
  ariaLabel,
  options,
  selectedIds,
  multiple,
  optionAction,
  menuFooter,
  onPick,
}: ListboxMenuOptionsProps) => (
  <>
    <ul
      id={listId}
      role="listbox"
      aria-label={ariaLabel}
      aria-multiselectable={multiple || undefined}
    >
      {options.map((option) => (
        <ListboxOptionItem
          key={option.value}
          option={option}
          active={selectedIds.includes(option.value)}
          multiple={multiple}
          action={optionAction?.(option)}
          onPick={onPick}
        />
      ))}
    </ul>
    {menuFooter}
  </>
);

type ListboxOptionItemProps = {
  option: ListboxOption;
  active: boolean;
  multiple: boolean;
  action: ReactNode | undefined;
  onPick: (value: string) => void;
};

const ListboxOptionItem = ({
  option,
  active,
  multiple,
  action,
  onPick,
}: ListboxOptionItemProps) => {
  const control = (
    <button
      type="button"
      role="option"
      aria-selected={active}
      className="site-select-option"
      onClick={() => {
        onPick(option.value);
      }}
    >
      {multiple ? <SelectionMark checked={active} shape="circle" /> : null}
      <span className="min-w-0 flex-1 whitespace-normal break-words">{option.label}</span>
    </button>
  );

  if (!action) {
    return <li role="none">{control}</li>;
  }

  return (
    <li role="none" className="site-select-option-row">
      {control}
      <div className="site-select-option-row__action">{action}</div>
    </li>
  );
};

type ListboxTriggerProps = {
  buttonRef: RefObject<HTMLButtonElement | null>;
  id: string | undefined;
  disabled: boolean;
  open: boolean;
  isField: boolean;
  isFit: boolean;
  className: string | undefined;
  ariaLabel: string;
  listId: string;
  triggerLabel: string;
  showPlaceholder: boolean;
  onBlur: FocusEventHandler<HTMLButtonElement> | undefined;
  onToggle: () => void;
};

export const ListboxTrigger = ({
  buttonRef,
  id,
  disabled,
  open,
  isField,
  isFit,
  className,
  ariaLabel,
  listId,
  triggerLabel,
  showPlaceholder,
  onBlur,
  onToggle,
}: ListboxTriggerProps) => (
  <button
    ref={buttonRef}
    id={id}
    type="button"
    disabled={disabled}
    className={cn(
      'col-start-1 row-start-1 w-full',
      isField
        ? cn('site-select-trigger', className)
        : cn(
            'flex min-w-0 w-full items-center justify-between gap-2 bg-transparent p-0 text-left',
            'text-sm font-medium text-ink-navy transition-colors duration-[var(--duration-fast)]',
            'hover:text-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
            'disabled:cursor-not-allowed disabled:opacity-50',
            open && 'text-brand-deep',
          ),
    )}
    aria-label={ariaLabel}
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-controls={listId}
    onBlur={onBlur}
    onClick={onToggle}
  >
    <span
      className={cn(
        isField ? 'site-select-trigger__label' : isFit ? 'whitespace-nowrap' : 'truncate',
        showPlaceholder && 'text-ink-muted',
      )}
    >
      {triggerLabel}
    </span>
    <ChevronDown
      className={cn(
        isField
          ? 'site-select-trigger__chevron'
          : cn(
              'size-4 shrink-0 text-header-muted transition-transform duration-[var(--duration-base)]',
              'ease-[var(--ease-out-premium)]',
              open && 'rotate-180 text-brand-deep',
            ),
      )}
      aria-hidden
    />
  </button>
);

type ListboxComboboxFieldProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  /** Omit so a FormField `htmlFor` does not focus/open search. */
  id?: string | undefined;
  disabled: boolean;
  open: boolean;
  listId: string;
  value: string;
  placeholder: string;
  ariaLabel: string;
  className: string | undefined;
  onChange: (value: string) => void;
  onClick: () => void;
};

/** Combobox input: search icon on the left, listbox below. */
export const ListboxComboboxField = ({
  inputRef,
  id,
  disabled,
  open,
  listId,
  value,
  placeholder,
  ariaLabel,
  className,
  onChange,
  onClick,
}: ListboxComboboxFieldProps) => (
  <div className="relative">
    <Search
      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
      aria-hidden
    />
    <input
      ref={inputRef}
      id={id}
      type="text"
      role="combobox"
      aria-expanded={open}
      aria-controls={listId}
      aria-autocomplete="list"
      aria-label={ariaLabel}
      disabled={disabled}
      value={value}
      placeholder={placeholder}
      autoComplete="off"
      className={cn(
        'site-select-trigger h-11 w-full pr-4 pl-10',
        'placeholder:text-ink-muted',
        className,
      )}
      onClick={onClick}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
      }}
    />
  </div>
);


