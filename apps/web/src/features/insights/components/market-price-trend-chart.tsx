'use client';

import { useId, useMemo } from 'react';

import type { MarketTrendPoint } from '@/features/insights/constants/market-insights-data';
import { cn } from '@/shared/ui/cn';

type MarketPriceTrendChartProps = {
  points: readonly MarketTrendPoint[];
  monthLabels: readonly string[];
  ariaLabel: string;
  className?: string | undefined;
};

const CHART_WIDTH = 640;
const CHART_HEIGHT = 168;
const PAD_X = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 28;

const buildLinePoints = (points: readonly MarketTrendPoint[], minY: number, maxY: number): string => {
  const plotWidth = CHART_WIDTH - PAD_X * 2;
  const plotHeight = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const lastIndex = Math.max(points.length - 1, 1);
  const span = Math.max(maxY - minY, 1);

  return points
    .map((point, index) => {
      const x = PAD_X + (index / lastIndex) * plotWidth;
      const y = PAD_TOP + plotHeight - ((point.value - minY) / span) * plotHeight;
      return `${x},${y}`;
    })
    .join(' ');
};

const buildAreaPath = (points: readonly MarketTrendPoint[], minY: number, maxY: number): string => {
  if (points.length === 0) {
    return '';
  }
  const plotWidth = CHART_WIDTH - PAD_X * 2;
  const plotHeight = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const lastIndex = Math.max(points.length - 1, 1);
  const span = Math.max(maxY - minY, 1);
  const baseline = PAD_TOP + plotHeight;

  const line = points
    .map((point, index) => {
      const x = PAD_X + (index / lastIndex) * plotWidth;
      const y = PAD_TOP + plotHeight - ((point.value - minY) / span) * plotHeight;
      return `${index === 0 ? 'M' : 'L'}${x} ${y}`;
    })
    .join(' ');

  return `${line} L${PAD_X + plotWidth} ${baseline} L${PAD_X} ${baseline} Z`;
};

/**
 * Single-series price trend chart for the market insights hero card.
 */
export const MarketPriceTrendChart = ({
  points,
  monthLabels,
  ariaLabel,
  className,
}: MarketPriceTrendChartProps) => {
  const gradientId = useId();

  const { line, area, labelIndexes } = useMemo(() => {
    const values = points.map((point) => point.value);
    const minY = Math.min(...values) * 0.985;
    const maxY = Math.max(...values) * 1.01;
    const indexes =
      points.length <= 6
        ? points.map((_, index) => index)
        : [0, 2, 4, 6, 8, 11].filter((index) => index < points.length);

    return {
      line: buildLinePoints(points, minY, maxY),
      area: buildAreaPath(points, minY, maxY),
      labelIndexes: indexes,
    };
  }, [points]);

  const plotWidth = CHART_WIDTH - PAD_X * 2;
  const lastIndex = Math.max(points.length - 1, 1);

  return (
    <div className={cn('w-full overflow-hidden', className)}>
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradientId})`} />
        <polyline
          points={line}
          fill="none"
          className="stroke-brand"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {labelIndexes.map((index) => {
          const x = PAD_X + (index / lastIndex) * plotWidth;
          return (
            <text
              key={points[index]?.monthKey ?? index}
              x={x}
              y={CHART_HEIGHT - 6}
              textAnchor="middle"
              className="fill-header-muted text-[10px]"
            >
              {monthLabels[index] ?? ''}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
