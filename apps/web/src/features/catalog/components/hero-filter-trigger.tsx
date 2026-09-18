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
  /** `compact` — Buy filter bar pill; default is the home hero cell. */
  variant?: 'hero' | 'compact' | undefined;
};

const COMPACT_TRIGGER_CLASS =
  'h-9 w-auto min-w-[9.5rem] gap-2 rounded-full border border-header-border bg-band-mist/60 px-4 py-0';
const HERO_TRIGGER_CLASS = cn(
  'gap-3 rounded-[18px] border border-header-border bg-surface-elevated px-3 py-3',
  'lg:w-auto lg:min-w-0 lg:gap-2 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0',
);

/**
 * Hero search field trigger — bordered block on mobile, plain inline on `lg+`.
 */
export const HeroFilterTrigger = forwardRef<HTMLButtonElement, HeroFilterTriggerProps>(
  (
    {
      label,
      value,
      open = false,
      mutedValue = false,
      variant = 'hero',
      className,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const isCompact = variant === 'compact';

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'flex min-w-0 items-center text-left',
          'transition-colors duration-[var(--duration-fast)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isCompact ? COMPACT_TRIGGER_CLASS : cn('w-full', HERO_TRIGGER_CLASS),
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            'flex min-w-0 flex-1 flex-col gap-0.5',
            isCompact ? 'flex-row items-center' : 'lg:contents',
          )}
        >
          <span
            className={cn(
              'text-[10px] font-bold tracking-[0.1em] text-header-muted uppercase',
              isCompact ? 'hidden' : 'lg:hidden',
            )}
          >
            {label}
          </span>
          <span
            className={cn(
              'truncate text-sm text-ink-navy',
              isCompact ? 'font-medium' : 'font-semibold lg:font-medium',
              mutedValue && 'text-ink-muted',
              open && !isCompact && 'lg:text-brand-deep',
              !mutedValue && !isCompact && 'lg:hover:text-brand-deep',
            )}
          >
            {value}
          </span>
        </span>

        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-header-muted',
            'transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-premium)]',
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
