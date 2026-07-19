"use client";

import type { CompanyMemberResponse } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { COMPANY_MEMBER_ROLES } from "@/features/builder/constants";
import { useUpdateMemberMutation } from "@/features/builder/hooks/use-company-members";
import { Button } from "@/shared/ui/button";

type TeamTableProps = {
  members: CompanyMemberResponse[];
  canManage: boolean;
};

/**
 * Company members table with role change and deactivate actions.
 */
export const TeamTable = ({ members, canManage }: TeamTableProps) => {
  const t = useTranslations("Builder.team");
  const updateMutation = useUpdateMemberMutation();
  const [toast, setToast] = useState<"success" | "error" | null>(null);

  const changeRole = async (
    member: CompanyMemberResponse,
    role: CompanyMemberResponse["role"],
  ) => {
    if (role === member.role) {
      return;
    }
    if (!window.confirm(t("confirm.role", { name: member.user.name, role }))) {
      return;
    }
    setToast(null);
    try {
      await updateMutation.mutateAsync({ id: member.id, body: { role } });
      setToast("success");
    } catch {
      setToast("error");
    }
  };

  const deactivate = async (member: CompanyMemberResponse) => {
    if (!window.confirm(t("confirm.deactivate", { name: member.user.name }))) {
      return;
    }
    setToast(null);
    try {
      await updateMutation.mutateAsync({
        id: member.id,
        body: { status: "inactive" },
      });
      setToast("success");
    } catch {
      setToast("error");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-3 py-2 font-medium">{t("columns.name")}</th>
              <th className="px-3 py-2 font-medium">{t("columns.email")}</th>
              <th className="px-3 py-2 font-medium">{t("columns.role")}</th>
              <th className="px-3 py-2 font-medium">{t("columns.status")}</th>
              {canManage ? (
                <th className="px-3 py-2 font-medium">{t("columns.actions")}</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-t border-border">
                <td className="px-3 py-2.5 font-medium text-ink">
                  {member.user.name}
                </td>
                <td className="px-3 py-2.5 text-ink-secondary">
                  {member.user.email}
                </td>
                <td className="px-3 py-2.5">
                  {canManage ? (
                    <select
                      className="h-9 rounded-sm border border-border bg-background px-2 text-sm"
                      value={member.role}
                      disabled={updateMutation.isPending}
                      onChange={(event) => {
                        void changeRole(
                          member,
                          event.target.value as CompanyMemberResponse["role"],
                        );
                      }}
                    >
                      {COMPANY_MEMBER_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {t(`roles.${role}`)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-ink-secondary">
                      {t(`roles.${member.role}`)}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-ink-secondary">
                  {t(`statuses.${member.status}`)}
                </td>
                {canManage ? (
                  <td className="px-3 py-2.5">
                    {member.status === "active" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={updateMutation.isPending}
                        onClick={() => {
                          void deactivate(member);
                        }}
                      >
                        {t("deactivate")}
                      </Button>
                    ) : (
                      "—"
                    )}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {toast === "success" ? (
        <p role="status" className="text-sm text-success">
          {t("updateSuccess")}
        </p>
      ) : null}
      {toast === "error" ? (
        <p role="alert" className="text-sm text-danger">
          {t("errors.generic")}
        </p>
      ) : null}
    </div>
  );
};
