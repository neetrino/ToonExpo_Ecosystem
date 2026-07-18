"use client";

import type { PortalReadinessScoreItem } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ReadinessHelpDialog } from "@/features/builder/components/readiness-help-dialog";
import { ReadinessStatusBadge } from "@/features/readiness/components/readiness-status-badge";
import { Button } from "@/shared/ui/button";

type BuilderReadinessCategoryCardProps = {
  score: PortalReadinessScoreItem;
};

const HELP_STATUSES = new Set(["needs_improvement", "in_progress"]);

/**
 * Per-category readiness progress card for builders.
 */
export const BuilderReadinessCategoryCard = ({
  score,
}: BuilderReadinessCategoryCardProps) => {
  const t = useTranslations("Builder.readiness");
  const [helpOpen, setHelpOpen] = useState(false);

  const showHelp =
    score.helpAvailable &&
    HELP_STATUSES.has(score.status) &&
    score.serviceProviderCategoryId != null;

  return (
    <>
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
        {showHelp ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="mt-3"
            onClick={() => {
              setHelpOpen(true);
            }}
          >
            {t("helpButton")}
          </Button>
        ) : null}
      </div>

      {helpOpen && score.serviceProviderCategoryId ? (
        <ReadinessHelpDialog
          categoryName={score.categoryName}
          categoryId={score.serviceProviderCategoryId}
          onClose={() => {
            setHelpOpen(false);
          }}
        />
      ) : null}
    </>
  );
};
