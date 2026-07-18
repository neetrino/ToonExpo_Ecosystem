"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { ReadinessAssessmentActions } from "@/features/admin/components/readiness-assessment-actions";
import { ReadinessCategoryScoreRow } from "@/features/admin/components/readiness-category-score-row";
import { ReadinessInternalNotesSection } from "@/features/admin/components/readiness-internal-notes-section";
import { ReadinessRecommendationsSection } from "@/features/admin/components/readiness-recommendations-section";
import { ReadinessRequiredActionsSection } from "@/features/admin/components/readiness-required-actions-section";
import {
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
} from "@/features/admin/constants";
import { useAdminCompaniesQuery } from "@/features/admin/hooks/use-admin-companies";
import { useAdminReadinessAssessmentQuery } from "@/features/admin/hooks/use-admin-readiness";
import { ReadinessStatusBadge } from "@/features/readiness/components/readiness-status-badge";
import { formatReadinessDate } from "@/features/readiness/utils/format-readiness-date";
import { Link } from "@/i18n/navigation";

type ReadinessAssessmentDetailPageProps = {
  assessmentId: string;
};

/**
 * Admin assessment detail: summary, category scores, nested CRUD sections.
 */
export const ReadinessAssessmentDetailPage = ({
  assessmentId,
}: ReadinessAssessmentDetailPageProps) => {
  const t = useTranslations("Admin.readiness.detail");
  const locale = useLocale();
  const query = useAdminReadinessAssessmentQuery(assessmentId);
  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);

  const companyName = useMemo(() => {
    const company = companiesQuery.data?.data.find(
      (item) => item.id === query.data?.builderCompanyId,
    );
    return company?.name ?? query.data?.builderCompanyId;
  }, [companiesQuery.data, query.data]);

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t("loading")}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex flex-col gap-3">
        <p role="alert" className="text-sm text-danger">
          {t("notFound")}
        </p>
        <Link
          href="/admin/readiness"
          className="text-sm font-medium text-brand hover:underline"
        >
          {t("back")}
        </Link>
      </div>
    );
  }

  const assessment = query.data;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/readiness"
          className="text-sm text-ink-secondary hover:text-ink"
        >
          {t("back")}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-ink">{companyName}</h1>
          <ReadinessStatusBadge
            status={assessment.status}
            namespace="Admin.readiness"
          />
        </div>
        <p className="text-sm text-ink-secondary">
          {t(`targetTypes.${assessment.targetType}`)}
          {assessment.projectId ? ` · ${assessment.projectId}` : ""}
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-ink-secondary">
          <span>
            {t("overallScore")}: {assessment.overallScore ?? "—"}
            {assessment.overallScoreOverridden ? ` (${t("overridden")})` : ""}
          </span>
          <span>
            {t("lastEvaluated")}:{" "}
            {formatReadinessDate(assessment.lastEvaluatedAt, locale)}
          </span>
        </div>
      </div>

      <ReadinessAssessmentActions assessment={assessment} />

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-ink">
          {t("categories.title")}
        </h2>
        <div className="flex flex-col gap-4">
          {assessment.scores.map((score) => (
            <ReadinessCategoryScoreRow
              key={score.id}
              assessmentId={assessment.id}
              score={score}
            />
          ))}
        </div>
      </section>

      <ReadinessRecommendationsSection
        assessmentId={assessment.id}
        recommendations={assessment.recommendations}
      />

      <ReadinessRequiredActionsSection
        assessmentId={assessment.id}
        requiredActions={assessment.requiredActions}
      />

      <ReadinessInternalNotesSection
        assessmentId={assessment.id}
        notes={assessment.internalNotes}
      />
    </div>
  );
};
