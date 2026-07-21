import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';

type CardVariant = 'muted' | 'elevated' | 'outline' | 'inverse';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: CardVariant | undefined;
  padding?: 'none' | 'sm' | 'md' | 'lg' | undefined;
};

const variantClassName: Record<CardVariant, string> = {
  muted: 'bg-surface shadow-xs',
  elevated: 'bg-surface-elevated shadow-sm border border-border/80',
  outline: 'bg-transparent border border-border',
  inverse: 'bg-surface-inverse text-on-dark',
};

const paddingClassName = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
} as const;

/**
 * Surface card with muted / elevated / outline / inverse variants.
 */
export const Card = ({
  className,
  children,
  variant = 'muted',
  padding = 'md',
  ...props
}: CardProps) => {
  return (
    <div
      className={cn('rounded-md', variantClassName[variant], paddingClassName[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
};
