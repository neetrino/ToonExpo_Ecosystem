"use client";

import type { PortalReadinessAssessmentItem } from "@toonexpo/contracts";
import { useLocale, useTranslations } from "next-intl";

import { ReadinessStatusBadge } from "@/features/readiness/components/readiness-status-badge";
import { formatReadinessDate } from "@/features/readiness/utils/format-readiness-date";
import { Card } from "@/shared/ui/card";

type BuilderReadinessSummaryCardProps = {
  assessment: PortalReadinessAssessmentItem;
};

/**
 * Overall readiness summary card for the builder portal.
 */
export const BuilderReadinessSummaryCard = ({
  assessment,
}: BuilderReadinessSummaryCardProps) => {
  const t = useTranslations("Builder.readiness");
  const locale = useLocale();

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-ink">
            {assessment.projectName ?? t("companyAssessment")}
          </h2>
          <ReadinessStatusBadge
            status={assessment.status}
            namespace="Builder.readiness"
          />
        </div>
        <p className="text-sm text-ink-secondary">
          {t(`targetTypes.${assessment.targetType}`)}
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="font-medium text-ink">
            {t("overallScore")}: {assessment.overallScore ?? "—"}
          </span>
          <span className="text-ink-secondary">
            {t("lastUpdated")}:{" "}
            {formatReadinessDate(assessment.lastEvaluatedAt, locale)}
          </span>
        </div>
      </div>
    </Card>
  );
};
