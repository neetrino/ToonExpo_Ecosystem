'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';

import { PHONE_MAX_LENGTH } from '@/shared/config/auth.constants';
import { cn } from '@/shared/ui/cn';

const PHONE_PREFIX = '+';
const MAX_PHONE_DIGITS = PHONE_MAX_LENGTH - PHONE_PREFIX.length;

export type PhoneInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'inputMode'
> & {
  value?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
};

const digitsOnly = (value: string): string => value.replace(/\D/g, '');

/**
 * Phone field with a fixed "+" prefix; digits only in the editable part.
 * Form value is always stored as `+` + digits (e.g. `+37491111222`).
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  { className, value = '', onChange, disabled, ...props },
  ref,
) {
  const digits = digitsOnly(value.startsWith(PHONE_PREFIX) ? value.slice(1) : value).slice(
    0,
    MAX_PHONE_DIGITS,
  );

  return (
    <div
      className={cn(
        'flex h-11 w-full overflow-hidden rounded-sm border border-border bg-surface-elevated',
        'transition-[border-color,box-shadow,background-color] duration-[var(--duration-fast)]',
        'hover:border-border-strong',
        'focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <span
        className="inline-flex shrink-0 items-center border-r border-border/70 bg-accent-soft/60 px-3.5 text-sm font-semibold tracking-wide text-ink-secondary"
        aria-hidden
      >
        {PHONE_PREFIX}
      </span>
      <input
        ref={ref}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        disabled={disabled}
        value={digits}
        className={cn(
          'h-full min-w-0 flex-1 border-0 bg-transparent px-3',
          'text-base text-ink sm:text-sm',
          'placeholder:text-ink-muted',
          'focus-visible:outline-none',
          'disabled:cursor-not-allowed',
        )}
        {...props}
        onChange={(event) => {
          const nextDigits = digitsOnly(event.target.value).slice(0, MAX_PHONE_DIGITS);
          onChange?.(nextDigits.length > 0 ? `${PHONE_PREFIX}${nextDigits}` : '');
        }}
      />
    </div>
  );
});
