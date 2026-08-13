'use client';

import { forwardRef, type KeyboardEvent, type InputHTMLAttributes } from 'react';

import {
  digitsOnly,
  MAX_PHONE_DIGITS,
  PHONE_PREFIX,
  sanitizePhoneInput,
} from '@/shared/lib/phone';
import { cn } from '@/shared/ui/cn';

export type PhoneInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'inputMode'
> & {
  value?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
};

const isDigitKey = (key: string): boolean => key.length === 1 && key >= '0' && key <= '9';

/**
 * Phone field with a fixed "+" prefix; digits only in the editable part.
 * Form value is always stored as `+` + digits (e.g. `+37491111222`), or empty.
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  { className, value = '', onChange, disabled, onKeyDown, ...props },
  ref,
) {
  const digits = digitsOnly(value.startsWith(PHONE_PREFIX) ? value.slice(1) : value).slice(
    0,
    MAX_PHONE_DIGITS,
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    if (event.key.length === 1 && !isDigitKey(event.key)) {
      event.preventDefault();
    }
  };

  return (
    <div
      className={cn(
        'flex h-11 w-full overflow-hidden rounded-sm border border-border bg-surface-elevated text-ink',
        'transition-[border-color,box-shadow,background-color] duration-[var(--duration-fast)]',
        'hover:border-border-strong',
        'focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <span
        className="inline-flex shrink-0 items-center pl-4 text-sm font-medium text-current"
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
          'h-full min-w-0 flex-1 border-0 bg-transparent py-0 pr-4 pl-1.5',
          'text-base text-inherit sm:text-sm',
          'placeholder:text-ink-muted',
          'focus-visible:outline-none',
          'disabled:cursor-not-allowed',
        )}
        {...props}
        onKeyDown={handleKeyDown}
        onChange={(event) => {
          onChange?.(sanitizePhoneInput(event.target.value));
        }}
      />
    </div>
  );
});
