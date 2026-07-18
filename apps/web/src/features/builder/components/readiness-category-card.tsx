"use client";

import type { PortalReadinessScoreItem } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";

import { ReadinessStatusBadge } from "@/features/readiness/components/readiness-status-badge";

type BuilderReadinessCategoryCardProps = {
  score: PortalReadinessScoreItem;
};

/**
 * Per-category readiness progress card for builders.
 */
export const BuilderReadinessCategoryCard = ({
  score,
}: BuilderReadinessCategoryCardProps) => {
  const t = useTranslations("Builder.readiness");

  return (
    <div className="rounded-sm border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">{score.categoryName}</h3>
        <ReadinessStatusBadge
          status={score.status}
          namespace="Builder.readiness"
        />
      </div>
      <p className="mt-2 text-sm text-ink-secondary">
        {t("categoryScore")}: {score.score ?? "—"}
      </p>
      {score.recommendationSummary ? (
        <p className="mt-2 text-sm text-ink">{score.recommendationSummary}</p>
      ) : (
        <p className="mt-2 text-sm text-ink-muted">{t("noRecommendation")}</p>
      )}
    </div>
  );
};
