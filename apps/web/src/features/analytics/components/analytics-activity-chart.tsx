'use client';

import { useId, useMemo } from 'react';
import { useLocale } from 'next-intl';

import { cn } from '@/shared/ui/cn';

export type AnalyticsActivityChartPoint = {
  date: string;
  users: number;
  projects: number;
};

type AnalyticsActivityChartProps = {
  points: AnalyticsActivityChartPoint[];
  usersLabel: string;
  projectsLabel: string;
  className?: string | undefined;
};

const CHART_WIDTH = 640;
const CHART_HEIGHT = 220;
const PAD_LEFT = 36;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;
const Y_TICK_COUNT = 5;

const niceCeil = (value: number): number => {
  if (value <= 0) {
    return 10;
  }
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
};

const buildPolyline = (
  points: AnalyticsActivityChartPoint[],
  key: 'users' | 'projects',
  maxY: number,
): string => {
  const plotWidth = CHART_WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const lastIndex = Math.max(points.length - 1, 1);

  return points
    .map((point, index) => {
      const x = PAD_LEFT + (index / lastIndex) * plotWidth;
      const y = PAD_TOP + plotHeight - (point[key] / maxY) * plotHeight;
      return `${x},${y}`;
    })
    .join(' ');
};

const buildAreaPath = (
  points: AnalyticsActivityChartPoint[],
  key: 'users' | 'projects',
  maxY: number,
): string => {
  if (points.length === 0) {
    return '';
  }
  const plotWidth = CHART_WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const lastIndex = Math.max(points.length - 1, 1);
  const baseline = PAD_TOP + plotHeight;

  const line = points
    .map((point, index) => {
      const x = PAD_LEFT + (index / lastIndex) * plotWidth;
      const y = PAD_TOP + plotHeight - (point[key] / maxY) * plotHeight;
      return `${index === 0 ? 'M' : 'L'}${x} ${y}`;
    })
    .join(' ');

  const lastX = PAD_LEFT + plotWidth;
  const firstX = PAD_LEFT;
  return `${line} L${lastX} ${baseline} L${firstX} ${baseline} Z`;
};

/**
 * Dual-series line chart for platform activity (SVG, no chart library).
 */
export const AnalyticsActivityChart = ({
  points,
  usersLabel,
  projectsLabel,
  className,
}: AnalyticsActivityChartProps) => {
  const locale = useLocale();
  const gradientId = useId();

  const { maxY, yTicks, xLabels, usersLine, projectsLine, projectsArea } = useMemo(() => {
    const peak = Math.max(
      0,
      ...points.flatMap((point) => [point.users, point.projects]),
    );
    const ceiling = niceCeil(peak);
    const ticks = Array.from({ length: Y_TICK_COUNT }, (_, index) =>
      Math.round((ceiling / (Y_TICK_COUNT - 1)) * index),
    );
    const labelIndexes =
      points.length <= 5
        ? points.map((_, index) => index)
        : [0, Math.floor(points.length / 4), Math.floor(points.length / 2), Math.floor((points.length * 3) / 4), points.length - 1];

    return {
      maxY: ceiling,
      yTicks: ticks,
      xLabels: labelIndexes.map((index) => ({
        index,
        label: new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(
          new Date(`${points[index]?.date ?? ''}T00:00:00.000Z`),
        ),
      })),
      usersLine: buildPolyline(points, 'users', ceiling),
      projectsLine: buildPolyline(points, 'projects', ceiling),
      projectsArea: buildAreaPath(points, 'projects', ceiling),
    };
  }, [locale, points]);

  const plotHeight = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const plotWidth = CHART_WIDTH - PAD_LEFT - PAD_RIGHT;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center gap-4 text-xs text-ink-secondary">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-brand-secondary" aria-hidden />
          {usersLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-info" aria-hidden />
          {projectsLabel}
        </span>
      </div>

      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label={`${usersLabel}, ${projectsLabel}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-info)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => {
            const y = PAD_TOP + plotHeight - (tick / maxY) * plotHeight;
            return (
              <g key={tick}>
                <line
                  x1={PAD_LEFT}
                  x2={CHART_WIDTH - PAD_RIGHT}
                  y1={y}
                  y2={y}
                  className="stroke-border"
                  strokeWidth={1}
                />
                <text
                  x={PAD_LEFT - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-ink-muted text-[10px]"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {points.length > 0 ? (
            <>
              <path d={projectsArea} fill={`url(#${gradientId})`} />
              <polyline
                points={projectsLine}
                fill="none"
                className="stroke-info"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <polyline
                points={usersLine}
                fill="none"
                className="stroke-brand-secondary"
                strokeWidth={2.25}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </>
          ) : null}

          {xLabels.map(({ index, label }) => {
            const x =
              PAD_LEFT +
              (index / Math.max(points.length - 1, 1)) * plotWidth;
            return (
              <text
                key={`${label}-${index}`}
                x={x}
                y={CHART_HEIGHT - 8}
                textAnchor="middle"
                className="fill-ink-muted text-[10px]"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
