import type { SelectHTMLAttributes } from 'react';

import { cn } from '@/shared/ui/cn';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

/** Shared luxury select field class — matches Input focus and surfaces. */
export const selectFieldClassName = cn(
  'select-field h-11 w-full rounded-sm border border-border bg-surface-elevated px-4 pr-10',
  'text-base text-ink sm:text-sm',
  'transition-[border-color,box-shadow,background-color] duration-[var(--duration-fast)]',
  'focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'hover:border-border-strong',
);

/**
 * Styled native select — custom chevron, brand focus ring, elevated surface.
 */
export const Select = ({ className, children, ...props }: SelectProps) => {
  return (
    <select className={cn(selectFieldClassName, className)} {...props}>
      {children}
    </select>
  );
};
