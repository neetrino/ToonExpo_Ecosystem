'use client';

import { Search } from 'lucide-react';
import type { ChangeEventHandler } from 'react';

import { cn } from '@/shared/ui/cn';
import { Input } from '@/shared/ui/input';

type SearchFieldProps = {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  'aria-label': string;
  className?: string | undefined;
  inputClassName?: string | undefined;
};

/**
 * White search input with leading magnifying-glass icon.
 */
export const SearchField = ({
  value,
  onChange,
  placeholder,
  'aria-label': ariaLabel,
  className,
  inputClassName,
}: SearchFieldProps) => (
  <div className={cn('relative min-w-0', className)}>
    <Search
      aria-hidden
      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
    />
    <Input
      type="search"
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={cn('h-10 w-full bg-surface-elevated pl-9', inputClassName)}
      onChange={onChange}
    />
  </div>
);
