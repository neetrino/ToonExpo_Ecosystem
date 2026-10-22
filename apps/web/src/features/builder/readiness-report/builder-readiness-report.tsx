'use client';

import type { PortalReadinessAssessmentItem } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import { downloadReadinessReport } from '@/features/builder/readiness-report/export-readiness-report';
import { buildReadinessReport } from '@/features/builder/readiness-report/report-model';
import { ReportEpics } from '@/features/builder/readiness-report/report-epics';
import { ReportHero } from '@/features/builder/readiness-report/report-hero';
import { ReportQuickView } from '@/features/builder/readiness-report/report-quick-view';
import { ReportRings } from '@/features/builder/readiness-report/report-rings';
import { ReportSummary } from '@/features/builder/readiness-report/report-summary';
import { READINESS_REPORT_WINDOW_DAYS } from '@/features/builder/readiness-report/report-styles';
import { formatReadinessDate } from '@/features/readiness/utils/format-readiness-date';
import { Button } from '@/shared/ui/button';

type BuilderReadinessReportProps = {
  assessment: PortalReadinessAssessmentItem;
  companyName: string;
  logoUrl: string | null;
  peerMedianPercent: number | null;
};

const reportWindowLabel = (locale: string): string => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - READINESS_REPORT_WINDOW_DAYS);
  return `${formatReadinessDate(start.toISOString(), locale)} — ${formatReadinessDate(end.toISOString(), locale)}`;
};

/**
 * Builder readiness report — same structure as the client progress report.
 */
export const BuilderReadinessReport = ({
  assessment,
  companyName,
  logoUrl,
  peerMedianPercent,
}: BuilderReadinessReportProps) => {
  const t = useTranslations('Builder.readiness');
  const reportT = useTranslations('Builder.readiness.report');
  const kpi = useTranslations('ReadinessKpi');
  const locale = useLocale();
  const report = buildReadinessReport(assessment, {
    title: assessment.projectName ?? companyName,
    categoryLabel: (code, fallback) =>
      kpi.has(`categories.${code}`) ? kpi(`categories.${code}`) : fallback,
    criterionLabel: (code) => (kpi.has(`criteria.${code}`) ? kpi(`criteria.${code}`) : code),
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink-secondary ring-1 ring-border">
          {reportT('viewOnly')}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            downloadReadinessReport(
              report,
              [
                reportT('columns.group'),
                reportT('columns.task'),
                reportT('columns.status'),
                reportT('columns.order'),
              ],
              (status) => reportT(`statuses.${status}`),
              'readiness-report.xls',
            );
          }}
        >
          {reportT('exportExcel')}
        </Button>
      </div>
      <ReportHero companyName={companyName} logoUrl={logoUrl} report={report} />
      <ReportQuickView report={report} periodLabel={reportWindowLabel(locale)} />
      <ReportRings report={report} peerMedianPercent={peerMedianPercent} />
      <ReportEpics report={report} />
      <ReportSummary report={report} />
      <p className="text-xs text-ink-muted">{reportT('refreshed')}</p>
      <p className="sr-only">{t('title')}</p>
    </div>
  );
};
