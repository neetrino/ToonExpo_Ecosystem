import type { TextareaHTMLAttributes } from 'react';

import { cn } from '@/shared/ui/cn';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Multi-line text control aligned with Input styling.
 */
export const Textarea = ({ className, ...props }: TextareaProps) => {
  return (
    <textarea
      className={cn(
        'min-h-28 w-full rounded-sm border border-border bg-surface-elevated px-4 py-3',
        'text-base text-ink sm:text-sm',
        'placeholder:text-ink-muted',
        'transition-[border-color,box-shadow] duration-[var(--duration-fast)]',
        'focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
};
