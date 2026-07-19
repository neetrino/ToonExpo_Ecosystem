"use client";

import type {
  ReadinessRequiredActionItem,
  ReadinessRequiredActionStatus,
} from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  useCreateReadinessRequiredActionMutation,
  useDeleteReadinessRequiredActionMutation,
  useUpdateReadinessRequiredActionMutation,
} from "@/features/admin/hooks/use-admin-readiness";
import {
  READINESS_REQUIRED_ACTION_STATUSES,
  READINESS_VISIBILITY_OPTIONS,
} from "@/features/readiness/constants";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

type ReadinessRequiredActionsSectionProps = {
  assessmentId: string;
  requiredActions: ReadinessRequiredActionItem[];
};

/**
 * CRUD section for required actions with status and visibility controls.
 */
export const ReadinessRequiredActionsSection = ({
  assessmentId,
  requiredActions,
}: ReadinessRequiredActionsSectionProps) => {
  const t = useTranslations("Admin.readiness.detail.requiredActions");
  const createMutation = useCreateReadinessRequiredActionMutation(assessmentId);
  const updateMutation = useUpdateReadinessRequiredActionMutation(assessmentId);
  const deleteMutation = useDeleteReadinessRequiredActionMutation(assessmentId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] =
    useState<ReadinessRequiredActionStatus>("open");
  const [visibility, setVisibility] =
    useState<(typeof READINESS_VISIBILITY_OPTIONS)[number]>("builder_visible");
  const [error, setError] = useState<string | null>(null);

  const onCreate = async () => {
    setError(null);
    if (!title.trim()) {
      setError(t("validation.required"));
      return;
    }
    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        status,
        visibility,
        ...(description.trim().length > 0
          ? { description: description.trim() }
          : {}),
      });
      setTitle("");
      setDescription("");
    } catch {
      setError(t("errors.generic"));
    }
  };

  const onStatusChange = async (
    action: ReadinessRequiredActionItem,
    next: ReadinessRequiredActionStatus,
  ) => {
    try {
      await updateMutation.mutateAsync({
        actionId: action.id,
        body: { status: next },
      });
    } catch {
      setError(t("errors.generic"));
    }
  };

  const onToggleVisibility = async (action: ReadinessRequiredActionItem) => {
    const next =
      action.visibility === "builder_visible"
        ? "internal_only"
        : "builder_visible";
    try {
      await updateMutation.mutateAsync({
        actionId: action.id,
        body: { visibility: next },
      });
    } catch {
      setError(t("errors.generic"));
    }
  };

  const onDelete = async (actionId: string) => {
    if (!window.confirm(t("deleteConfirm"))) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(actionId);
    } catch {
      setError(t("errors.generic"));
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-ink">{t("title")}</h2>

      <ul className="flex flex-col gap-3">
        {requiredActions.map((action) => (
          <li key={action.id} className="rounded-sm border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-ink">{action.title}</p>
                {action.description ? (
                  <p className="mt-1 text-sm text-ink-secondary">
                    {action.description}
                  </p>
                ) : null}
              </div>
              <span className="text-xs text-ink-muted">
                {t(`visibility.${action.visibility}`)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <FormField id={`action-status-${action.id}`} label={t("status")}>
                <select
                  id={`action-status-${action.id}`}
                  className="h-9 rounded-sm border border-border bg-background px-3 text-sm text-ink"
                  value={action.status}
                  disabled={updateMutation.isPending}
                  onChange={(event) => {
                    void onStatusChange(
                      action,
                      event.target.value as ReadinessRequiredActionStatus,
                    );
                  }}
                >
                  {READINESS_REQUIRED_ACTION_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {t(`statuses.${item}`)}
                    </option>
                  ))}
                </select>
              </FormField>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={updateMutation.isPending}
                onClick={() => {
                  void onToggleVisibility(action);
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
                  void onDelete(action.id);
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
        <FormField id="action-title" label={t("fields.title")}>
          <Input
            id="action-title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
          />
        </FormField>
        <FormField id="action-description" label={t("fields.description")}>
          <Textarea
            id="action-description"
            rows={2}
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
            }}
          />
        </FormField>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField id="action-status-new" label={t("status")}>
            <select
              id="action-status-new"
              className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as ReadinessRequiredActionStatus);
              }}
            >
              {READINESS_REQUIRED_ACTION_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {t(`statuses.${item}`)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="action-visibility" label={t("fields.visibility")}>
            <select
              id="action-visibility"
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
        </div>
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
