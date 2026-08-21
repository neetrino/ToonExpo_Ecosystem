import type { ComponentPropsWithRef } from 'react';

import { cn } from '@/shared/ui/cn';
import { FORM_CONTROL_TEXT_CLASS } from '@/shared/ui/form-control-text';

export type InputProps = ComponentPropsWithRef<'input'>;

/**
 * Text input — 16px on mobile to avoid iOS zoom; focus ring via brand.
 */
export const Input = ({ className, type = 'text', ...props }: InputProps) => {
  return (
    <input
      type={type}
      className={cn(
        'h-11 w-full rounded-[15px] border border-border bg-surface-elevated px-4',
        FORM_CONTROL_TEXT_CLASS,
        'text-ink',
        'placeholder:text-ink-muted',
        'transition-[border-color,box-shadow,background-color] duration-[var(--duration-fast)]',
        'hover:border-border-strong',
        'focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        /* Hide native number steppers when type="number" (also covered in base.css). */
        '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
        className,
      )}
      {...props}
      // Chrome iOS injects `__gcruniqueid` before hydrate — false mismatch in `next dev`.
      suppressHydrationWarning
    />
  );
};
