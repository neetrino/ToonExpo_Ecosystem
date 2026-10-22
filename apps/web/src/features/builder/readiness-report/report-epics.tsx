'use client';

import type { ReadinessReport } from '@/features/builder/readiness-report/report-model';
import { ReportEpicCard } from '@/features/builder/readiness-report/report-epic-card';
import { ReportTaskRow } from '@/features/builder/readiness-report/report-task';
import { REPORT_CARD_CLASS } from '@/features/builder/readiness-report/report-styles';
import { useTranslations } from 'next-intl';

type ReportEpicsProps = {
  report: ReadinessReport;
};

export const ReportEpics = ({ report }: ReportEpicsProps) => {
  const t = useTranslations('Builder.readiness.report');

  return (
    <section className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
        {t('workEyebrow')}
      </p>
      <h2 className="text-2xl font-semibold tracking-tight text-ink">{t('workTitle')}</h2>
      <p className="text-sm text-ink-secondary">{t('workHint', { count: report.epics.length })}</p>
      <div className="grid items-start gap-3 lg:grid-cols-2">
        {report.epics.map((epic) => (
          <ReportEpicCard key={epic.id} epic={epic} />
        ))}
      </div>
      {report.unassigned.length > 0 ? (
        <article className={REPORT_CARD_CLASS}>
          <h3 className="px-4 py-3 text-sm font-semibold text-ink">
            {t('unassigned', { count: report.unassigned.length })}
          </h3>
          <ul>
            {report.unassigned.map((task, index) => (
              <ReportTaskRow key={task.id} task={task} index={index} />
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  );
};
