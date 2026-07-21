import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
  variant?: 'ghost' | 'outline' | 'soft' | undefined;
  size?: 'sm' | 'md' | 'lg' | undefined;
};

const sizeClassName = {
  sm: 'size-9',
  md: 'size-10',
  lg: 'size-11',
} as const;

const variantClassName = {
  ghost: 'border-transparent bg-transparent hover:bg-surface text-ink',
  outline: 'border-border bg-surface-elevated hover:border-border-strong hover:bg-surface text-ink',
  soft: 'border-transparent bg-brand-soft text-brand hover:bg-brand/15',
} as const;

/**
 * Accessible icon-only control with explicit accessible name.
 */
export const IconButton = ({
  label,
  children,
  className,
  variant = 'ghost',
  size = 'md',
  type = 'button',
  ...props
}: IconButtonProps) => {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-sm border',
        'transition-colors duration-[var(--duration-fast)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        sizeClassName[size],
        variantClassName[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
