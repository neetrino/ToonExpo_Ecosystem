'use client';

import type { ReadinessReport } from '@/features/builder/readiness-report/report-model';
import { REPORT_PANEL_CLASS } from '@/features/builder/readiness-report/report-styles';
import { ReadinessProgressRing } from '@/features/readiness/components/readiness-progress-ring';
import { useTranslations } from 'next-intl';

type ReportRingsProps = {
  report: ReadinessReport;
  peerMedianPercent: number | null;
};

export const ReportRings = ({ report, peerMedianPercent }: ReportRingsProps) => {
  const t = useTranslations('Builder.readiness.report');
  const hasMedian = peerMedianPercent !== null;
  const sentence = report.attention > 0 ? t('attentionSentence') : t('onTrackSentence');

  return (
    <section className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
        {t('ringsEyebrow')}
      </p>
      <h2 className="text-2xl font-semibold tracking-tight text-ink">{t('ringsTitle')}</h2>
      <p className="text-sm text-ink-secondary">{t('ringsHint')}</p>
      <div className={`${REPORT_PANEL_CLASS} flex flex-col items-center gap-4 text-center`}>
        <div className="flex items-center gap-6">
          <div>
            <ReadinessProgressRing
              percent={report.percent}
              size="lg"
              tone="brand"
              label={t('progress')}
            />
            <p className="mt-1 text-xs text-ink-muted">{t('progress')}</p>
          </div>
          <span className="h-16 w-px bg-border" aria-hidden />
          <div>
            {hasMedian ? (
              <ReadinessProgressRing
                percent={peerMedianPercent}
                size="sm"
                tone="warning"
                label={t('median')}
              />
            ) : (
              <p className="flex size-16 items-center justify-center text-lg font-semibold text-ink-muted">
                {t('dateUnknown')}
              </p>
            )}
            <p className="mt-1 text-xs text-ink-muted">{t('median')}</p>
          </div>
        </div>
        <p className="text-sm font-semibold text-ink">
          {t('tasksLine', { done: report.done, total: report.total })}
        </p>
        <p className="text-sm text-ink-secondary">{sentence}</p>
      </div>
    </section>
  );
};
