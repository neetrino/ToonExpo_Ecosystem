'use client';

import { cn } from '@/shared/ui/cn';

type ReadinessProgressRingProps = {
  percent: number;
  size?: 'sm' | 'md' | 'lg' | undefined;
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'muted' | undefined;
  className?: string | undefined;
  label?: string | undefined;
};

const SIZE_CLASS: Record<NonNullable<ReadinessProgressRingProps['size']>, string> = {
  sm: 'size-14',
  md: 'size-24',
  lg: 'size-40',
};

const TEXT_CLASS: Record<NonNullable<ReadinessProgressRingProps['size']>, string> = {
  sm: 'text-[0.65rem]',
  md: 'text-lg',
  lg: 'text-3xl',
};

const STROKE_CLASS: Record<NonNullable<ReadinessProgressRingProps['tone']>, string> = {
  brand: 'stroke-brand',
  success: 'stroke-success',
  warning: 'stroke-warning',
  danger: 'stroke-danger',
  muted: 'stroke-ink-muted',
};

const STROKE_WIDTH: Record<NonNullable<ReadinessProgressRingProps['size']>, number> = {
  sm: 2.4,
  md: 2.8,
  lg: 3,
};

/**
 * Circular readiness progress ring.
 */
export const ReadinessProgressRing = ({
  percent,
  size = 'md',
  tone = 'brand',
  className,
  label,
}: ReadinessProgressRingProps) => {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const display = `${clamped}%`;

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        SIZE_CLASS[size],
        className,
      )}
      role="img"
      aria-label={label ?? display}
    >
      <svg viewBox="0 0 36 36" className="size-full -rotate-90" aria-hidden>
        <circle
          cx="18"
          cy="18"
          r="15.2"
          fill="none"
          className="stroke-border"
          strokeWidth={STROKE_WIDTH[size]}
        />
        <circle
          cx="18"
          cy="18"
          r="15.2"
          fill="none"
          className={STROKE_CLASS[tone]}
          strokeWidth={STROKE_WIDTH[size]}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${clamped} 100`}
        />
      </svg>
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center font-semibold tabular-nums tracking-tight text-ink',
          TEXT_CLASS[size],
        )}
      >
        {display}
      </span>
    </div>
  );
};
