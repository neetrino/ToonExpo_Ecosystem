'use client';

import {
  Children,
  forwardRef,
  isValidElement,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';

import { cn } from '@/shared/ui/cn';
import { ListboxSelect, type ListboxOption } from '@/shared/ui/listbox-select';

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  children: ReactNode;
};

/** Shared field chrome for legacy native selects (search inputs, etc.). */
export const selectFieldClassName = cn(
  'select-field h-11 w-full rounded-sm border border-border bg-surface-elevated px-4 pr-10',
  'text-base text-ink sm:text-sm',
  'transition-[border-color,box-shadow,background-color] duration-[var(--duration-fast)]',
  'focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'hover:border-border-strong',
);

type OptionElementProps = {
  value?: string | number | readonly string[] | undefined;
  children?: ReactNode | undefined;
  disabled?: boolean | undefined;
};

/**
 * Form select with the same custom dropdown panel as home / LocaleSwitcher.
 * Accepts native `<option>` children; open menu is not OS-default.
 *
 * For react-hook-form prefer `Controller` + `value`/`onChange`, not `register`.
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    children,
    className,
    value,
    defaultValue,
    onChange,
    onBlur,
    name,
    id,
    disabled,
    'aria-label': ariaLabel,
  },
  ref,
) {
  const options = optionsFromChildren(children);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() =>
    resolveInitialValue(defaultValue, options),
  );
  const currentValue = isControlled ? String(value) : internalValue;

  const handleChange = (next: string): void => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(createSelectChangeEvent(next, name));
  };

  const handleBlur = (event: FocusEvent<HTMLButtonElement>): void => {
    onBlur?.(event as unknown as FocusEvent<HTMLSelectElement>);
  };

  return (
    <ListboxSelect
      ref={ref}
      variant="field"
      id={id}
      name={name}
      disabled={disabled}
      value={currentValue}
      options={options}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      aria-label={ariaLabel ?? id ?? name ?? 'Select'}
    />
  );
});

const optionsFromChildren = (children: ReactNode): ListboxOption[] => {
  const options: ListboxOption[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return;
    }
    if (child.type !== 'option') {
      return;
    }
    const props = (child as ReactElement<OptionElementProps>).props;
    if (props.disabled) {
      return;
    }
    options.push({
      value: String(props.value ?? ''),
      label: flattenLabel(props.children),
    });
  });

  return options;
};

const resolveInitialValue = (
  defaultValue: SelectProps['defaultValue'],
  options: readonly ListboxOption[],
): string => {
  if (defaultValue != null && defaultValue !== '') {
    return String(Array.isArray(defaultValue) ? defaultValue[0] : defaultValue);
  }
  return options[0]?.value ?? '';
};

const flattenLabel = (node: ReactNode): string => {
  if (node == null || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(flattenLabel).join('');
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return flattenLabel(node.props.children);
  }
  return '';
};

const createSelectChangeEvent = (
  next: string,
  name: string | undefined,
): ChangeEvent<HTMLSelectElement> => {
  const target = { value: next, name: name ?? '' };
  return {
    target,
    currentTarget: target,
  } as ChangeEvent<HTMLSelectElement>;
};
