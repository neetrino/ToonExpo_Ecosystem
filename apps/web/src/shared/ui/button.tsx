import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'soft';
type ButtonSize = 'md' | 'sm' | 'lg' | 'icon';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-on-brand hover:bg-brand-hover focus-visible:ring-brand/40',
  secondary: 'bg-cta-dark text-on-dark hover:bg-cta-dark/90 focus-visible:ring-cta-dark/30',
  soft: 'bg-brand-soft text-brand hover:bg-brand/15 focus-visible:ring-brand/30',
  ghost:
    'border border-border-strong bg-transparent text-ink hover:bg-surface focus-visible:ring-border-strong/60',
  outline:
    'border border-border bg-surface-elevated text-ink hover:border-border-strong hover:bg-surface focus-visible:ring-brand/30',
  danger: 'bg-danger text-on-dark hover:bg-danger/90 focus-visible:ring-danger/40',
};

const sizeClassName: Record<ButtonSize, string> = {
  lg: 'h-12 px-6 text-sm gap-2',
  md: 'h-11 px-5 text-sm gap-2',
  sm: 'h-9 px-4 text-sm gap-1.5',
  icon: 'size-10 p-0',
};

/**
 * Shared button with premium variants for public and portal surfaces.
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  disabled,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-sm font-medium',
        'transition-[color,background-color,border-color,box-shadow,transform] duration-[var(--duration-fast)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        variantClassName[variant],
        sizeClassName[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
