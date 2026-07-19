"use client";

import type { PortalReadinessAssessmentItem } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";

import { BuilderReadinessCategoryCard } from "@/features/builder/components/readiness-category-card";
import { BuilderReadinessSummaryCard } from "@/features/builder/components/readiness-summary-card";
import { usePortalReadinessQuery } from "@/features/builder/hooks/use-portal-readiness";

const AssessmentView = ({
  assessment,
}: {
  assessment: PortalReadinessAssessmentItem;
}) => {
  const t = useTranslations("Builder.readiness");

  return (
    <div className="flex flex-col gap-8">
      <BuilderReadinessSummaryCard assessment={assessment} />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-ink">
          {t("categoriesTitle")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {assessment.scores.map((score) => (
            <BuilderReadinessCategoryCard key={score.categoryId} score={score} />
          ))}
        </div>
      </section>

      {assessment.requiredActions.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-ink">
            {t("requiredActionsTitle")}
          </h2>
          <ul className="flex flex-col gap-2">
            {assessment.requiredActions.map((action) => (
              <li
                key={action.id}
                className="rounded-sm border border-border p-4"
              >
                <p className="font-medium text-ink">{action.title}</p>
                {action.description ? (
                  <p className="mt-1 text-sm text-ink-secondary">
                    {action.description}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-ink-muted">
                  {t(`actionStatuses.${action.status}`)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {assessment.recommendations.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-ink">
            {t("recommendationsTitle")}
          </h2>
          <ul className="flex flex-col gap-2">
            {assessment.recommendations.map((rec) => (
              <li
                key={rec.id}
                className="rounded-sm border border-border p-4"
              >
                <p className="font-medium text-ink">{rec.title}</p>
                <p className="mt-1 text-sm text-ink-secondary">
                  {rec.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
};

/**
 * Builder portal readiness view (read-only, server-filtered data).
 */
export const BuilderReadinessPage = () => {
  const t = useTranslations("Builder.readiness");
  const query = usePortalReadinessQuery();

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t("loading")}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t("error")}
      </p>
    );
  }

  const assessments = query.data.data;

  if (assessments.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-secondary">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-secondary">{t("subtitle")}</p>
      </div>

      {assessments.map((assessment) => (
        <AssessmentView key={assessment.id} assessment={assessment} />
      ))}
    </div>
  );
};
