import type { ReportTaskStatus } from '@/features/builder/readiness-report/report-model';

const FILL_CLASS: Record<ReportTaskStatus, string> = {
  not_started: 'fill-ink-muted',
  in_progress: 'fill-brand',
  done: 'fill-success',
  attention: 'fill-danger',
};

const METER_FILL = {
  success: 'fill-success',
  warning: 'fill-warning',
  danger: 'fill-danger',
  muted: 'fill-ink-muted',
} as const;

type MeterTone = keyof typeof METER_FILL;

type StatusBarProps = {
  counts: Record<ReportTaskStatus, number>;
  total: number;
};

const STATUS_ORDER: readonly ReportTaskStatus[] = [
  'not_started',
  'in_progress',
  'done',
  'attention',
];

/**
 * Segmented status bar. Widths are SVG attributes so the bar stays free of inline CSS.
 */
export const ReadinessStatusBar = ({ counts, total }: StatusBarProps) => {
  let offset = 0;
  const segments = STATUS_ORDER.map((status) => {
    const width = total === 0 ? 0 : (counts[status] / total) * 100;
    const segment = { status, offset, width };
    offset += width;
    return segment;
  });

  return (
    <svg viewBox="0 0 100 2" className="h-2 w-full" preserveAspectRatio="none" aria-hidden>
      <rect width="100" height="2" className="fill-border" />
      {segments.map((segment) =>
        segment.width === 0 ? null : (
          <rect
            key={segment.status}
            x={segment.offset}
            width={segment.width}
            height="2"
            className={FILL_CLASS[segment.status]}
          />
        ),
      )}
    </svg>
  );
};

type ReportMeterProps = {
  percent: number;
  tone: MeterTone;
};

export const meterToneFor = (percent: number, attention: boolean): MeterTone => {
  if (percent >= 100) {
    return 'success';
  }
  if (attention) {
    return 'danger';
  }
  if (percent === 0) {
    return 'muted';
  }
  return 'warning';
};

export const ReportMeter = ({ percent, tone }: ReportMeterProps) => (
  <svg viewBox="0 0 100 2" className="mt-2 h-1.5 w-full" preserveAspectRatio="none" aria-hidden>
    <rect width="100" height="2" className="fill-border" />
    <rect width={Math.max(0, Math.min(100, percent))} height="2" className={METER_FILL[tone]} />
  </svg>
);
