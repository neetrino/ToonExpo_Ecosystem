'use client';

import { ChevronDown } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/shared/ui/cn';

type HeroFilterTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  value: string;
  open?: boolean | undefined;
  /** Softer value color when showing the empty/placeholder state. */
  mutedValue?: boolean | undefined;
};

/**
 * Hero search field trigger — bordered block on mobile, plain inline on `lg+`.
 */
export const HeroFilterTrigger = forwardRef<HTMLButtonElement, HeroFilterTriggerProps>(
  (
    { label, value, open = false, mutedValue = false, className, type = 'button', ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'flex w-full min-w-0 items-center text-left',
          'transition-colors duration-[var(--duration-fast)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
          'disabled:cursor-not-allowed disabled:opacity-50',
          // Mobile: Figma filter block
          'gap-3 rounded-[18px] border border-header-border bg-surface-elevated px-3 py-3',
          // Desktop: plain hero row cell
          'lg:w-auto lg:min-w-0 lg:gap-2 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0',
          className,
        )}
        {...props}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.5 lg:contents">
          <span className="text-[10px] font-bold tracking-[0.1em] text-header-muted uppercase lg:hidden">
            {label}
          </span>
          <span
            className={cn(
              'truncate text-sm font-semibold text-ink-navy lg:font-medium',
              mutedValue && 'text-ink-muted',
              open && 'lg:text-brand-deep',
              !mutedValue && 'lg:hover:text-brand-deep',
            )}
          >
            {value}
          </span>
        </span>

        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-header-muted transition-transform duration-[var(--duration-fast)]',
            open && 'rotate-180',
            open && 'lg:text-brand-deep',
          )}
          aria-hidden
        />
      </button>
    );
  },
);

HeroFilterTrigger.displayName = 'HeroFilterTrigger';
