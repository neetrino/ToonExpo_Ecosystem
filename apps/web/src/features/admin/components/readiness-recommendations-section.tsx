"use client";

import type { ReadinessRecommendationItem } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  useCreateReadinessRecommendationMutation,
  useDeleteReadinessRecommendationMutation,
  useUpdateReadinessRecommendationMutation,
} from "@/features/admin/hooks/use-admin-readiness";
import { READINESS_VISIBILITY_OPTIONS } from "@/features/readiness/constants";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

type ReadinessRecommendationsSectionProps = {
  assessmentId: string;
  recommendations: ReadinessRecommendationItem[];
};

/**
 * CRUD section for assessment recommendations with visibility toggle.
 */
export const ReadinessRecommendationsSection = ({
  assessmentId,
  recommendations,
}: ReadinessRecommendationsSectionProps) => {
  const t = useTranslations("Admin.readiness.detail.recommendations");
  const createMutation = useCreateReadinessRecommendationMutation(assessmentId);
  const updateMutation = useUpdateReadinessRecommendationMutation(assessmentId);
  const deleteMutation = useDeleteReadinessRecommendationMutation(assessmentId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] =
    useState<(typeof READINESS_VISIBILITY_OPTIONS)[number]>("builder_visible");
  const [error, setError] = useState<string | null>(null);

  const onCreate = async () => {
    setError(null);
    if (!title.trim() || !description.trim()) {
      setError(t("validation.required"));
      return;
    }
    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        visibility,
      });
      setTitle("");
      setDescription("");
    } catch {
      setError(t("errors.generic"));
    }
  };

  const onToggleVisibility = async (item: ReadinessRecommendationItem) => {
    const next =
      item.visibility === "builder_visible"
        ? "internal_only"
        : "builder_visible";
    try {
      await updateMutation.mutateAsync({
        recId: item.id,
        body: { visibility: next },
      });
    } catch {
      setError(t("errors.generic"));
    }
  };

  const onDelete = async (recId: string) => {
    if (!window.confirm(t("deleteConfirm"))) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(recId);
    } catch {
      setError(t("errors.generic"));
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-ink">{t("title")}</h2>

      <ul className="flex flex-col gap-3">
        {recommendations.map((item) => (
          <li
            key={item.id}
            className="rounded-sm border border-border p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-ink">{item.title}</p>
                <p className="mt-1 text-sm text-ink-secondary">
                  {item.description}
                </p>
              </div>
              <span className="text-xs text-ink-muted">
                {t(`visibility.${item.visibility}`)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={updateMutation.isPending}
                onClick={() => {
                  void onToggleVisibility(item);
                }}
              >
                {t("toggleVisibility")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  void onDelete(item.id);
                }}
              >
                {t("delete")}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 rounded-sm border border-dashed border-border p-4">
        <h3 className="text-sm font-medium text-ink">{t("addTitle")}</h3>
        <FormField id="rec-title" label={t("fields.title")}>
          <Input
            id="rec-title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
          />
        </FormField>
        <FormField id="rec-description" label={t("fields.description")}>
          <Textarea
            id="rec-description"
            rows={3}
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
            }}
          />
        </FormField>
        <FormField id="rec-visibility" label={t("fields.visibility")}>
          <select
            id="rec-visibility"
            className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
            value={visibility}
            onChange={(event) => {
              setVisibility(
                event.target.value as (typeof READINESS_VISIBILITY_OPTIONS)[number],
              );
            }}
          >
            {READINESS_VISIBILITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`visibility.${option}`)}
              </option>
            ))}
          </select>
        </FormField>
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
        <Button
          type="button"
          size="sm"
          disabled={createMutation.isPending}
          onClick={() => {
            void onCreate();
          }}
        >
          {createMutation.isPending ? t("adding") : t("add")}
        </Button>
      </div>
    </section>
  );
};
