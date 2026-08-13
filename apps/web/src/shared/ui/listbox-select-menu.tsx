'use client';

import { Check, ChevronDown } from 'lucide-react';
import type { FocusEventHandler, ReactNode, RefObject } from 'react';

import { cn } from '@/shared/ui/cn';

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
  action: ReactNode | undefined;
  onPick: (value: string) => void;
};

const ListboxOptionItem = ({ option, active, action, onPick }: ListboxOptionItemProps) => {
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
      <span>{option.label}</span>
      {active ? <Check className="site-select-option__check" aria-hidden /> : null}
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
