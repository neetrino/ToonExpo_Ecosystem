"use client";

import type { CrmDealDetail } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { PORTAL_MAX_PAGE_SIZE } from "@/features/builder/constants";
import { useCompanyMembersQuery } from "@/features/builder/hooks/use-company-members";
import { useUpdateCrmDealMutation } from "@/features/builder/hooks/use-portal-crm";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";

type CrmDealAssigneeControlProps = {
  deal: CrmDealDetail;
};

/**
 * Assignee select backed by company members.
 */
export const CrmDealAssigneeControl = ({
  deal,
}: CrmDealAssigneeControlProps) => {
  const t = useTranslations("Builder.crm.detail");
  const membersQuery = useCompanyMembersQuery(1, PORTAL_MAX_PAGE_SIZE);
  const mutation = useUpdateCrmDealMutation(deal.id);
  const [assigneeId, setAssigneeId] = useState(deal.assignedUserId ?? "");
  const [error, setError] = useState<string | null>(null);

  const dirty = assigneeId !== (deal.assignedUserId ?? "");
  const members = (membersQuery.data?.data ?? []).filter(
    (member) => member.status === "active",
  );

  const onSave = async () => {
    setError(null);
    try {
      await mutation.mutateAsync({
        assignedUserId: assigneeId.length > 0 ? assigneeId : null,
      });
    } catch {
      setError(t("errors.generic"));
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-sm border border-border p-4">
      <h2 className="text-sm font-semibold text-ink">{t("assigneeTitle")}</h2>
      <FormField id="deal-assignee" label={t("assignee")}>
        <select
          id="deal-assignee"
          className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
          value={assigneeId}
          disabled={membersQuery.isLoading || mutation.isPending}
          onChange={(event) => {
            setAssigneeId(event.target.value);
          }}
        >
          <option value="">{t("unassigned")}</option>
          {members.map((member) => (
            <option key={member.user.id} value={member.user.id}>
              {member.user.name}
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
        disabled={!dirty || mutation.isPending}
        onClick={() => {
          void onSave();
        }}
      >
        {mutation.isPending ? t("saving") : t("saveAssignee")}
      </Button>
    </div>
  );
};
