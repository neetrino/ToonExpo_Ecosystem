'use client';

import type {
  ReadinessAssessmentListItem,
  ReadinessAssessmentTargetType,
  ReadinessScoreStatus,
} from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import { ReadinessStatusBadge } from '@/features/readiness/components/readiness-status-badge';
import { formatReadinessDate } from '@/features/readiness/utils/format-readiness-date';
import { Link } from '@/i18n/navigation';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type CompanyLookup = Map<string, string>;

type ReadinessAssessmentsTableProps = {
  assessments: ReadinessAssessmentListItem[];
  companyLookup: CompanyLookup;
  viewMode?: ViewMode | undefined;
};

/**
 * Assessments collection as table or card grid for platform admin.
 */
export const ReadinessAssessmentsTable = ({
  assessments,
  companyLookup,
  viewMode = 'list',
}: ReadinessAssessmentsTableProps) => {
  const t = useTranslations('Admin.readiness.assessments');
  const locale = useLocale();

  const targetLabel = (target: ReadinessAssessmentTargetType): string => t(`targetTypes.${target}`);

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <AdminListCardGrid>
        {assessments.map((assessment) => (
          <Link
            key={assessment.id}
            href={`/admin/readiness/${assessment.id}`}
            className="flex flex-col gap-2 rounded-sm border border-border bg-background p-3 transition-colors hover:bg-surface/60"
          >
            <span className="font-medium text-ink">
              {companyLookup.get(assessment.builderCompanyId) ?? assessment.builderCompanyId}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <ReadinessStatusBadge
                status={assessment.status as ReadinessScoreStatus}
                namespace="Admin.readiness"
              />
              <span className="text-xs text-ink-muted">{targetLabel(assessment.targetType)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
              <span>
                {t('columns.score')}: {assessment.overallScore ?? '—'}
                {assessment.overallScoreOverridden ? ` (${t('overridden')})` : ''}
              </span>
              <span aria-hidden>·</span>
              <span>{formatReadinessDate(assessment.lastEvaluatedAt, locale)}</span>
            </div>
          </Link>
        ))}
      </AdminListCardGrid>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
        <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th className="px-3 py-2 font-medium">{t('columns.company')}</th>
            <th className="px-3 py-2 font-medium">{t('columns.target')}</th>
            <th className="px-3 py-2 font-medium">{t('columns.status')}</th>
            <th className="px-3 py-2 font-medium">{t('columns.score')}</th>
            <th className="px-3 py-2 font-medium">{t('columns.evaluated')}</th>
          </tr>
        </thead>
        <tbody>
          {assessments.map((assessment) => (
            <tr key={assessment.id} className="border-t border-border hover:bg-surface/60">
              <td className="px-3 py-2.5">
                <Link
                  href={`/admin/readiness/${assessment.id}`}
                  className="font-medium text-brand hover:underline"
                >
                  {companyLookup.get(assessment.builderCompanyId) ?? assessment.builderCompanyId}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-ink-secondary">
                {targetLabel(assessment.targetType)}
                {assessment.projectId ? (
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    {assessment.projectId}
                  </span>
                ) : null}
              </td>
              <td className="px-3 py-2.5">
                <ReadinessStatusBadge
                  status={assessment.status as ReadinessScoreStatus}
                  namespace="Admin.readiness"
                />
              </td>
              <td className="px-3 py-2.5 text-ink-secondary">
                {assessment.overallScore ?? '—'}
                {assessment.overallScoreOverridden ? (
                  <span className="ml-1 text-xs text-ink-muted">({t('overridden')})</span>
                ) : null}
              </td>
              <td className="px-3 py-2.5 text-ink-secondary">
                {formatReadinessDate(assessment.lastEvaluatedAt, locale)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
