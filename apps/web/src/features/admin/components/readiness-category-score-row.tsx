"use client";

import type { ReadinessScoreItem, ReadinessScoreStatus } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { useUpsertReadinessScoreMutation } from "@/features/admin/hooks/use-admin-readiness";
import { ReadinessStatusBadge } from "@/features/readiness/components/readiness-status-badge";
import {
  READINESS_SCORE_MAX,
  READINESS_SCORE_MIN,
  READINESS_SCORE_STATUSES,
} from "@/features/readiness/constants";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

type ReadinessCategoryScoreRowProps = {
  assessmentId: string;
  score: ReadinessScoreItem;
};

/**
 * Inline category evaluation row with save action.
 */
export const ReadinessCategoryScoreRow = ({
  assessmentId,
  score,
}: ReadinessCategoryScoreRowProps) => {
  const t = useTranslations("Admin.readiness.detail.categories");
  const mutation = useUpsertReadinessScoreMutation(
    assessmentId,
    score.categoryId,
  );
  const [scoreValue, setScoreValue] = useState(
    score.score === null ? "" : String(score.score),
  );
  const [status, setStatus] = useState<ReadinessScoreStatus>(score.status);
  const [summary, setSummary] = useState(score.recommendationSummary ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setScoreValue(score.score === null ? "" : String(score.score));
    setStatus(score.status);
    setSummary(score.recommendationSummary ?? "");
  }, [score]);

  const dirty =
    scoreValue !== (score.score === null ? "" : String(score.score)) ||
    status !== score.status ||
    summary !== (score.recommendationSummary ?? "");

  const onSave = async () => {
    setError(null);
    setSaved(false);
    const parsed =
      scoreValue.trim() === "" ? undefined : Number.parseInt(scoreValue, 10);
    if (
      parsed !== undefined &&
      (Number.isNaN(parsed) ||
        parsed < READINESS_SCORE_MIN ||
        parsed > READINESS_SCORE_MAX)
    ) {
      setError(t("validation.score"));
      return;
    }
    try {
      await mutation.mutateAsync({
        ...(parsed !== undefined ? { score: parsed } : {}),
        status,
        recommendationSummary: summary.trim().length > 0 ? summary.trim() : null,
      });
      setSaved(true);
    } catch {
      setError(t("errors.generic"));
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-sm border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">{score.categoryName}</h3>
        <ReadinessStatusBadge status={score.status} namespace="Admin.readiness" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField id={`score-${score.id}`} label={t("score")}>
          <Input
            id={`score-${score.id}`}
            type="number"
            min={READINESS_SCORE_MIN}
            max={READINESS_SCORE_MAX}
            value={scoreValue}
            onChange={(event) => {
              setScoreValue(event.target.value);
            }}
          />
        </FormField>

        <FormField id={`status-${score.id}`} label={t("status")}>
          <select
            id={`status-${score.id}`}
            className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as ReadinessScoreStatus);
            }}
          >
            {READINESS_SCORE_STATUSES.map((item) => (
              <option key={item} value={item}>
                {t(`statuses.${item}`)}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField id={`summary-${score.id}`} label={t("recommendationSummary")}>
        <Textarea
          id={`summary-${score.id}`}
          rows={2}
          value={summary}
          onChange={(event) => {
            setSummary(event.target.value);
          }}
        />
      </FormField>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="text-sm text-success">
          {t("saved")}
        </p>
      ) : null}

      <Button
        type="button"
        size="sm"
        disabled={!dirty || mutation.isPending}
        onClick={() => {
          void onSave();
        }}
      >
        {mutation.isPending ? t("saving") : t("save")}
      </Button>
    </div>
  );
};
