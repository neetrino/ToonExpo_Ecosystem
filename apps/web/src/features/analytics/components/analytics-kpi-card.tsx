import type { LucideIcon } from 'lucide-react';

import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/ui/cn';

export type AnalyticsKpiTone =
  | 'teal'
  | 'accent'
  | 'blue'
  | 'orange'
  | 'sky'
  | 'green';

type AnalyticsKpiCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: AnalyticsKpiTone;
  trendLabel: string;
  changePercent: number | null;
  className?: string | undefined;
};

/**
 * Icon well colors sampled from the admin analytics mock.
 * bg = pastel square, fg = icon stroke.
 */
const TONE_BG_CLASS: Record<AnalyticsKpiTone, string> = {
  teal: 'bg-[#d3f6f6]',
  accent: 'bg-[#f3effd]',
  blue: 'bg-[#ebf3fc]',
  orange: 'bg-[#fcefe5]',
  sky: 'bg-[#ebf4fd]',
  green: 'bg-[#dff1f3]',
};

const TONE_ICON_CLASS: Record<AnalyticsKpiTone, string> = {
  teal: 'text-[#2bb5ad]',
  accent: 'text-[#6b5ce7]',
  blue: 'text-[#3d7fd4]',
  orange: 'text-[#f07a35]',
  sky: 'text-[#3d8ef0]',
  green: 'text-[#2a9d8f]',
};

const ICON_WELL_SIZE_CLASS = 'size-12';
const ICON_STROKE_WIDTH = 2;

const formatTrendArrow = (changePercent: number | null): string => {
  if (changePercent == null || changePercent === 0) {
    return '—';
  }
  return changePercent > 0 ? '↑' : '↓';
};

/**
 * KPI card with tinted icon on the left and metric text on the right.
 */
export const AnalyticsKpiCard = ({
  label,
  value,
  icon: Icon,
  tone,
  trendLabel,
  changePercent,
  className,
}: AnalyticsKpiCardProps) => {
  const isPositive = changePercent != null && changePercent > 0;
  const isNegative = changePercent != null && changePercent < 0;
  const percentText =
    changePercent == null
      ? '0%'
      : `${Math.abs(changePercent).toLocaleString(undefined, {
          maximumFractionDigits: 1,
        })}%`;

  return (
    <Card
      variant="elevated"
      padding="none"
      className={cn(
        'flex flex-row items-start gap-4 p-4 sm:p-5',
        // Tailwind v4 moves Y via `translate` (not only `transform`) — both must transition.
        'transition-[translate,box-shadow] duration-[400ms]',
        'ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
        'hover:-translate-y-1 hover:shadow-md',
        'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        className,
      )}
    >
      <div
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-xl',
          ICON_WELL_SIZE_CLASS,
          TONE_BG_CLASS[tone],
        )}
      >
        <Icon
          className={cn('size-6', TONE_ICON_CLASS[tone])}
          strokeWidth={ICON_STROKE_WIDTH}
          aria-hidden
        />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-[11px] font-medium tracking-[0.06em] text-ink-muted uppercase">
          {label}
        </p>
        <p className="text-3xl leading-tight font-semibold tracking-tight text-ink">
          {value}
        </p>
        <p className="text-xs text-ink-muted">
          <span
            className={cn(
              'font-medium',
              isPositive && 'text-success',
              isNegative && 'text-danger',
              !isPositive && !isNegative && 'text-ink-muted',
            )}
          >
            {formatTrendArrow(changePercent)} {percentText}
          </span>{' '}
          {trendLabel}
        </p>
      </div>
    </Card>
  );
};
