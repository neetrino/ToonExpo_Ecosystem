"use client";

import type { CrmActivityType, CrmDealDetail } from "@toonexpo/contracts";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import {
  useAddCrmActivityMutation,
  useUpdateCrmActivityMutation,
} from "@/features/builder/hooks/use-portal-crm";
import { CRM_ACTIVITY_TYPES } from "@/features/builder/schemas/crm.schema";
import { formatBuyerDateTime } from "@/features/buyer/utils/format-datetime";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type CrmDealActivitiesSectionProps = {
  deal: CrmDealDetail;
};

/**
 * Activities list with done checkbox and add form.
 */
export const CrmDealActivitiesSection = ({
  deal,
}: CrmDealActivitiesSectionProps) => {
  const t = useTranslations("Builder.crm.detail");
  const locale = useLocale();
  const addMutation = useAddCrmActivityMutation(deal.id);
  const updateMutation = useUpdateCrmActivityMutation(deal.id);
  const [type, setType] = useState<CrmActivityType>("follow_up");
  const [dueAt, setDueAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onAdd = async () => {
    setError(null);
    try {
      await addMutation.mutateAsync({
        type,
        title: t(`activityTypes.${type}`),
        ...(dueAt ? { dueAt: new Date(dueAt).toISOString() } : {}),
      });
      setDueAt("");
    } catch {
      setError(t("errors.generic"));
    }
  };

  const onToggleDone = async (activityId: string, done: boolean) => {
    setError(null);
    try {
      await updateMutation.mutateAsync({
        activityId,
        body: { status: done ? "done" : "planned" },
      });
    } catch {
      setError(t("errors.generic"));
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-sm border border-border p-4">
      <h2 className="text-sm font-semibold text-ink">{t("activitiesTitle")}</h2>

      {deal.activities.length === 0 ? (
        <p className="text-sm text-ink-muted">{t("activitiesEmpty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {deal.activities.map((activity) => (
            <li
              key={activity.id}
              className="flex items-start gap-3 rounded-sm bg-surface px-3 py-2"
            >
              <input
                type="checkbox"
                className="mt-1"
                checked={activity.status === "done"}
                disabled={updateMutation.isPending}
                aria-label={t("markDone")}
                onChange={(event) => {
                  void onToggleDone(activity.id, event.target.checked);
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{activity.title}</p>
                <p className="text-xs text-ink-muted">
                  {t(`activityTypes.${activity.type}`)}
                  {activity.dueAt
                    ? ` · ${formatBuyerDateTime(activity.dueAt, locale)}`
                    : null}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField id="activity-type" label={t("activityType")}>
          <select
            id="activity-type"
            className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
            value={type}
            onChange={(event) => {
              setType(event.target.value as CrmActivityType);
            }}
          >
            {CRM_ACTIVITY_TYPES.map((activityType) => (
              <option key={activityType} value={activityType}>
                {t(`activityTypes.${activityType}`)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="activity-due" label={t("activityDue")}>
          <Input
            id="activity-due"
            type="datetime-local"
            value={dueAt}
            onChange={(event) => {
              setDueAt(event.target.value);
            }}
          />
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
        disabled={addMutation.isPending}
        onClick={() => {
          void onAdd();
        }}
      >
        {addMutation.isPending ? t("saving") : t("addActivity")}
      </Button>
    </section>
  );
};
