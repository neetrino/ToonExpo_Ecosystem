'use client';

import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState, type InputHTMLAttributes } from 'react';

import { cn } from '@/shared/ui/cn';

export type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  revealLabel: string;
  hideLabel: string;
};

/**
 * Password field with show/hide toggle (eye icon).
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, revealLabel, hideLabel, disabled, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    const toggleLabel = visible ? hideLabel : revealLabel;

    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          disabled={disabled}
          className={cn(
            'h-11 w-full rounded-sm border border-border bg-surface-elevated py-2 pl-4 pr-11',
            'text-base text-ink sm:text-sm',
            'placeholder:text-ink-muted',
            'transition-[border-color,box-shadow,background-color] duration-[var(--duration-fast)]',
            'hover:border-border-strong',
            'focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        />
        <button
          type="button"
          aria-label={toggleLabel}
          title={toggleLabel}
          disabled={disabled}
          className={cn(
            'absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center',
            'text-ink-muted transition-colors duration-[var(--duration-fast)]',
            'hover:text-ink focus-visible:outline-none focus-visible:text-brand',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
            <Eye className="size-4" aria-hidden />
          ) : (
            <EyeOff className="size-4" aria-hidden />
          )}
        </button>
      </div>
    );
  },
);
