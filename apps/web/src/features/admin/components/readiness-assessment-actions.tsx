"use client";

import type { ReadinessAssessmentDetail } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useUpdateReadinessAssessmentMutation } from "@/features/admin/hooks/use-admin-readiness";
import {
  READINESS_SCORE_MAX,
  READINESS_SCORE_MIN,
  READINESS_SCORE_STATUSES,
} from "@/features/readiness/constants";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type ReadinessAssessmentActionsProps = {
  assessment: ReadinessAssessmentDetail;
};

/**
 * Assessment-level actions: status, score override, archive.
 */
export const ReadinessAssessmentActions = ({
  assessment,
}: ReadinessAssessmentActionsProps) => {
  const t = useTranslations("Admin.readiness.detail.actions");
  const mutation = useUpdateReadinessAssessmentMutation(assessment.id);
  const [status, setStatus] = useState(assessment.status);
  const [overrideScore, setOverrideScore] = useState(
    assessment.overallScore === null ? "" : String(assessment.overallScore),
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const onUpdateStatus = async () => {
    setError(null);
    setMessage(null);
    try {
      await mutation.mutateAsync({ status });
      setMessage(t("statusSaved"));
    } catch {
      setError(t("errors.generic"));
    }
  };

  const onOverrideScore = async () => {
    setError(null);
    setMessage(null);
    const trimmed = overrideScore.trim();
    const parsed = trimmed === "" ? null : Number.parseInt(trimmed, 10);
    if (
      parsed !== null &&
      (Number.isNaN(parsed) ||
        parsed < READINESS_SCORE_MIN ||
        parsed > READINESS_SCORE_MAX)
    ) {
      setError(t("validation.score"));
      return;
    }
    try {
      await mutation.mutateAsync({ overallScore: parsed });
      setMessage(t("scoreSaved"));
    } catch {
      setError(t("errors.generic"));
    }
  };

  const onArchive = async () => {
    if (!window.confirm(t("archiveConfirm"))) {
      return;
    }
    setError(null);
    setMessage(null);
    try {
      await mutation.mutateAsync({ archive: true });
      setMessage(t("archived"));
    } catch {
      setError(t("errors.generic"));
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-sm border border-border p-4">
      <h2 className="text-sm font-semibold text-ink">{t("title")}</h2>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <FormField id="assessment-status" label={t("status")}>
            <select
              id="assessment-status"
              className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
              value={status}
              disabled={mutation.isPending}
              onChange={(event) => {
                setStatus(event.target.value as typeof status);
              }}
            >
              {READINESS_SCORE_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {t(`statuses.${item}`)}
                </option>
              ))}
            </select>
          </FormField>
          <Button
            type="button"
            size="sm"
            disabled={mutation.isPending || status === assessment.status}
            onClick={() => {
              void onUpdateStatus();
            }}
          >
            {mutation.isPending ? t("saving") : t("saveStatus")}
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <FormField id="overall-score" label={t("overrideScore")}>
            <Input
              id="overall-score"
              type="number"
              min={READINESS_SCORE_MIN}
              max={READINESS_SCORE_MAX}
              value={overrideScore}
              onChange={(event) => {
                setOverrideScore(event.target.value);
              }}
            />
          </FormField>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={mutation.isPending}
            onClick={() => {
              void onOverrideScore();
            }}
          >
            {t("saveScore")}
          </Button>
        </div>
      </div>

      <Button
        type="button"
        size="sm"
        variant="danger"
        disabled={mutation.isPending || assessment.archivedAt !== null}
        onClick={() => {
          void onArchive();
        }}
      >
        {t("archive")}
      </Button>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="text-sm text-success">
          {message}
        </p>
      ) : null}
    </div>
  );
};
