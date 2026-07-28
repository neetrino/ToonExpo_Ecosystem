'use client';

import { cn } from '@/shared/ui/cn';

type SwitchSize = 'sm' | 'md';

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean | undefined;
  id?: string | undefined;
  size?: SwitchSize | undefined;
  'aria-label': string;
};

const TRACK_CLASS: Record<SwitchSize, string> = {
  sm: 'h-5 w-9',
  md: 'h-6 w-11',
};

const THUMB_CLASS: Record<SwitchSize, string> = {
  sm: 'size-4',
  md: 'size-5',
};

const THUMB_ON_CLASS: Record<SwitchSize, string> = {
  sm: 'translate-x-4',
  md: 'translate-x-5',
};

/**
 * Compact on/off switch — brand track when on, muted when off.
 */
export const Switch = ({
  checked,
  onCheckedChange,
  disabled = false,
  id,
  size = 'sm',
  'aria-label': ariaLabel,
}: SwitchProps) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    disabled={disabled}
    className={cn(
      'relative inline-flex shrink-0 items-center rounded-pill',
      TRACK_CLASS[size],
      'transition-colors duration-[var(--duration-fast)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
      'disabled:cursor-not-allowed disabled:opacity-50',
      checked ? 'bg-brand' : 'bg-border-strong',
    )}
    onClick={() => {
      if (disabled) {
        return;
      }
      onCheckedChange(!checked);
    }}
  >
    <span
      aria-hidden
      className={cn(
        'pointer-events-none rounded-full bg-surface-elevated shadow-xs',
        THUMB_CLASS[size],
        'transition-transform duration-[var(--duration-fast)]',
        checked ? THUMB_ON_CLASS[size] : 'translate-x-0.5',
      )}
    />
  </button>
);
