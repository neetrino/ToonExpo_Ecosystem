'use client';

import type {
  ReadinessReport,
  ReportTaskStatus,
} from '@/features/builder/readiness-report/report-model';
import { ReadinessStatusBar } from '@/features/builder/readiness-report/report-meters';
import {
  REPORT_CARD_CLASS,
  REPORT_PANEL_CLASS,
} from '@/features/builder/readiness-report/report-styles';
import { ReadinessProgressRing } from '@/features/readiness/components/readiness-progress-ring';
import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';
import { cn } from '@/shared/ui/cn';
import { useTranslations } from 'next-intl';

const STATUS_ORDER: readonly ReportTaskStatus[] = [
  'not_started',
  'in_progress',
  'done',
  'attention',
];

const DOT_CLASS: Record<ReportTaskStatus, string> = {
  not_started: 'bg-ink-muted',
  in_progress: 'bg-brand',
  done: 'bg-success',
  attention: 'bg-danger',
};

type ReportHeroProps = {
  companyName: string;
  logoUrl: string | null;
  report: ReadinessReport;
};

const initials = (name: string): string =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();

export const ReportHero = ({ companyName, logoUrl, report }: ReportHeroProps) => {
  const t = useTranslations('Builder.readiness.report');
  const src = resolvePublicAssetUrl(logoUrl);
  const sentence = report.attention > 0 ? t('attentionSentence') : t('onTrackSentence');

  return (
    <section className={cn(REPORT_PANEL_CLASS, 'flex flex-col gap-5')}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
        {t('summaryBadge')}
      </p>
      <div className="flex items-center gap-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-surface-elevated ring-1 ring-border">
          {src ? (
            <img src={src} alt="" className="size-full object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-ink-muted">
              {initials(companyName)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-3xl font-semibold tracking-tight text-ink">
            {report.title}
          </h2>
          <p className="mt-1 text-sm text-ink-secondary">{sentence}</p>
        </div>
      </div>
      <ReadinessStatusBar counts={report.counts} total={report.total} />
      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink-secondary">
        {STATUS_ORDER.map((status) => (
          <li key={status} className="inline-flex items-center gap-1.5">
            <span className={cn('size-2 rounded-full', DOT_CLASS[status])} aria-hidden />
            {t(`statuses.${status}`)} · {report.counts[status]}
          </li>
        ))}
      </ul>
      <div className={cn(REPORT_CARD_CLASS, 'flex flex-col gap-5 p-5 sm:flex-row sm:items-center')}>
        <ReadinessProgressRing
          percent={report.percent}
          size="lg"
          tone="brand"
          label={t('progress')}
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            {t('readinessLabel')}
          </p>
          <p className="text-3xl font-semibold tabular-nums text-ink">
            {report.done}/{report.total}
          </p>
          <p className="text-sm text-ink-secondary">{t('doneTasks')}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-4 border-t border-border pt-4">
        <div>
          <dt className="text-2xl font-semibold tabular-nums text-ink">{report.open}</dt>
          <dd className="text-sm text-ink-secondary">{t('openItems')}</dd>
        </div>
        <div>
          <dt className="text-2xl font-semibold tabular-nums text-danger">{report.attention}</dt>
          <dd className="text-sm text-ink-secondary">{t('deadlineAttention')}</dd>
        </div>
      </dl>
    </section>
  );
};
