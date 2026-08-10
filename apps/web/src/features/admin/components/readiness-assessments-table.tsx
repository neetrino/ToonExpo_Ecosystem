'use client';

import type {
  ReadinessAssessmentListItem,
  ReadinessAssessmentTargetType,
  ReadinessScoreStatus,
} from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import {
  AdminReadinessAssessmentCard,
  type AdminReadinessCompanyInfo,
} from '@/features/admin/components/admin-readiness-assessment-card';
import { ReadinessStatusBadge } from '@/features/readiness/components/readiness-status-badge';
import { formatReadinessDate } from '@/features/readiness/utils/format-readiness-date';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { ListTableReveal } from '@/shared/ui/motion';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type CompanyLookup = Map<string, AdminReadinessCompanyInfo>;

type ReadinessAssessmentsTableProps = {
  assessments: ReadinessAssessmentListItem[];
  companyLookup: CompanyLookup;
  onOpenAssessment: (assessment: ReadinessAssessmentListItem) => void;
  viewMode?: ViewMode | undefined;
};

/**
 * Assessments collection as table or card grid for platform admin.
 */
export const ReadinessAssessmentsTable = ({
  assessments,
  companyLookup,
  onOpenAssessment,
  viewMode = VIEW_MODE_CARDS,
}: ReadinessAssessmentsTableProps) => {
  const t = useTranslations('Admin.readiness.assessments');
  const locale = useLocale();

  const targetLabel = (target: ReadinessAssessmentTargetType): string => t(`targetTypes.${target}`);
  const companyInfo = (assessment: ReadinessAssessmentListItem): AdminReadinessCompanyInfo =>
    companyLookup.get(assessment.builderCompanyId) ?? {
      name: assessment.builderCompanyId,
      logoUrl: null,
    };

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <AdminListCardGrid className="gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {assessments.map((assessment) => (
          <AdminReadinessAssessmentCard
            key={assessment.id}
            assessment={assessment}
            company={companyInfo(assessment)}
            onOpen={() => {
              onOpenAssessment(assessment);
            }}
          />
        ))}
      </AdminListCardGrid>
    );
  }

  return (
    <ListTableReveal>
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
                  <button
                    type="button"
                    className="font-medium text-brand hover:underline"
                    onClick={() => {
                      onOpenAssessment(assessment);
                    }}
                  >
                    {companyInfo(assessment).name}
                  </button>
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
    </ListTableReveal>
  );
};
