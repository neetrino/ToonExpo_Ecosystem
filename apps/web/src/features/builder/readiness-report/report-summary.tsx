'use client';

import type { ReadinessReport } from '@/features/builder/readiness-report/report-model';
import { REPORT_CARD_CLASS } from '@/features/builder/readiness-report/report-styles';
import { useTranslations } from 'next-intl';

type ReportSummaryProps = {
  report: ReadinessReport;
};

export const ReportSummary = ({ report }: ReportSummaryProps) => {
  const t = useTranslations('Builder.readiness.report');
  const lines = [
    t('onTime', { count: report.onTime }),
    t('late', { count: report.late }),
    t('missed', { count: report.overdue }),
    t('waiting', { count: report.pending }),
    t('doneNoDeadline', { count: report.doneWithoutDeadline }),
    t('openNoDeadline', { count: report.openWithoutDeadline }),
  ];
  if (report.completionDateUnknown > 0) {
    lines.push(t('completionUnknown', { count: report.completionDateUnknown }));
  }

  return (
    <section className="flex flex-col gap-6">
      <article className={`${REPORT_CARD_CLASS} p-5`}>
        <h2 className="text-lg font-semibold text-ink">{t('summaryTitle')}</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          {t('summaryLine', { total: report.total, done: report.done })}
        </p>
        <ul className="mt-4 flex flex-col gap-2 text-sm text-ink">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-ink-muted">{t('summaryNote')}</p>
      </article>
      <article className={`${REPORT_CARD_CLASS} p-5`}>
        <h2 className="text-lg font-semibold text-ink">
          {t('orderTitle')}
          <span className="ml-2 text-sm font-medium text-ink-muted">
            {report.completionOrder.length}
          </span>
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">{t('orderHint')}</p>
        {report.completionOrder.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">{t('orderEmpty')}</p>
        ) : (
          <ol className="mt-4 flex flex-col gap-3">
            {report.completionOrder.map((task) => (
              <li key={task.id} className="text-sm">
                <span className="font-semibold text-ink">#{task.sequence}</span>
                <span className="mt-0.5 block font-medium text-ink">{task.title}</span>
                {task.epicTitle ? (
                  <span className="block text-ink-secondary">{task.epicTitle}</span>
                ) : null}
                <span className="text-ink-muted">{t(`outcomes.${task.outcome}`)}</span>
              </li>
            ))}
          </ol>
        )}
      </article>
    </section>
  );
};
