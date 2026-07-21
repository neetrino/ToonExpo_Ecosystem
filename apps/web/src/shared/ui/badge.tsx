import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';

type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone | undefined;
  children: ReactNode;
};

const toneClassName: Record<BadgeTone, string> = {
  neutral: 'bg-surface text-ink-label border-border',
  brand: 'bg-brand-soft text-brand border-transparent',
  success: 'bg-success-soft text-success border-transparent',
  warning: 'bg-warning-soft text-warning border-transparent',
  danger: 'bg-danger-soft text-danger border-transparent',
  info: 'bg-info-soft text-info border-transparent',
};

/**
 * Compact status / metadata pill.
 */
export const Badge = ({ tone = 'neutral', className, children, ...props }: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill border px-2.5 py-0.5',
        'text-[10px] font-bold uppercase tracking-wide',
        toneClassName[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};
