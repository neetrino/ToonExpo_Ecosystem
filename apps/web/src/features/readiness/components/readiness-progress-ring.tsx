'use client';

import {
  RING_STROKE_CLASS,
  type ReadinessRingTone,
} from '@/features/readiness/utils/readiness-ring-tone';
import { cn } from '@/shared/ui/cn';

type ReadinessProgressRingProps = {
  percent: number;
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | undefined;
  tone?: ReadinessRingTone | undefined;
  /** When false, only the ring is shown (value lives beside the ring in layouts). */
  showValue?: boolean | undefined;
  className?: string | undefined;
  label?: string | undefined;
};

const SIZE_CLASS: Record<NonNullable<ReadinessProgressRingProps['size']>, string> = {
  '2xs': 'size-7',
  xs: 'size-20',
  sm: 'size-16',
  md: 'size-28',
  lg: 'size-40',
};

const TEXT_CLASS: Record<NonNullable<ReadinessProgressRingProps['size']>, string> = {
  '2xs': 'text-[0.55rem]',
  xs: 'text-sm',
  sm: 'text-[0.7rem]',
  md: 'text-xl',
  lg: 'text-3xl',
};

const STROKE_WIDTH: Record<NonNullable<ReadinessProgressRingProps['size']>, number> = {
  '2xs': 3.8,
  xs: 4,
  sm: 4.4,
  md: 4.6,
  lg: 4.8,
};

const RING_RADIUS = 14.6;

/**
 * Circular readiness progress ring.
 */
export const ReadinessProgressRing = ({
  percent,
  size = 'md',
  tone = 'brand',
  showValue = true,
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
          r={RING_RADIUS}
          fill="none"
          className="stroke-border"
          strokeWidth={STROKE_WIDTH[size]}
        />
        <circle
          cx="18"
          cy="18"
          r={RING_RADIUS}
          fill="none"
          className={RING_STROKE_CLASS[tone]}
          strokeWidth={STROKE_WIDTH[size]}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${clamped} 100`}
        />
      </svg>
      {showValue ? (
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center font-semibold tabular-nums tracking-tight text-ink',
            TEXT_CLASS[size],
          )}
        >
          {display}
        </span>
      ) : null}
    </div>
  );
};
