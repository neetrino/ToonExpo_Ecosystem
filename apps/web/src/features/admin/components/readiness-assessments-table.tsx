"use client";

import type {
  ReadinessAssessmentListItem,
  ReadinessAssessmentTargetType,
  ReadinessScoreStatus,
} from "@toonexpo/contracts";
import { useLocale, useTranslations } from "next-intl";

import { ReadinessStatusBadge } from "@/features/readiness/components/readiness-status-badge";
import { formatReadinessDate } from "@/features/readiness/utils/format-readiness-date";
import { Link } from "@/i18n/navigation";

type CompanyLookup = Map<string, string>;

type ReadinessAssessmentsTableProps = {
  assessments: ReadinessAssessmentListItem[];
  companyLookup: CompanyLookup;
};

/**
 * Paginated assessments table for platform admin.
 */
export const ReadinessAssessmentsTable = ({
  assessments,
  companyLookup,
}: ReadinessAssessmentsTableProps) => {
  const t = useTranslations("Admin.readiness.assessments");
  const locale = useLocale();

  const targetLabel = (target: ReadinessAssessmentTargetType): string =>
    t(`targetTypes.${target}`);

  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
        <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th className="px-3 py-2 font-medium">{t("columns.company")}</th>
            <th className="px-3 py-2 font-medium">{t("columns.target")}</th>
            <th className="px-3 py-2 font-medium">{t("columns.status")}</th>
            <th className="px-3 py-2 font-medium">{t("columns.score")}</th>
            <th className="px-3 py-2 font-medium">{t("columns.evaluated")}</th>
          </tr>
        </thead>
        <tbody>
          {assessments.map((assessment) => (
            <tr
              key={assessment.id}
              className="border-t border-border hover:bg-surface/60"
            >
              <td className="px-3 py-2.5">
                <Link
                  href={`/admin/readiness/${assessment.id}`}
                  className="font-medium text-brand hover:underline"
                >
                  {companyLookup.get(assessment.builderCompanyId) ??
                    assessment.builderCompanyId}
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
                {assessment.overallScore ?? "—"}
                {assessment.overallScoreOverridden ? (
                  <span className="ml-1 text-xs text-ink-muted">
                    ({t("overridden")})
                  </span>
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
