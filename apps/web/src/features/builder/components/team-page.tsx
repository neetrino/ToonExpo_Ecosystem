"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { InviteMemberForm } from "@/features/builder/components/invite-member-form";
import { TeamTable } from "@/features/builder/components/team-table";
import { PORTAL_DEFAULT_PAGE_SIZE } from "@/features/builder/constants";
import {
  useCompanyMembersQuery,
  useIsCompanyAdminQuery,
} from "@/features/builder/hooks/use-company-members";
import { CatalogPagination } from "@/features/catalog/components/catalog-pagination";
import { isApiErrorStatus } from "@/shared/api/errors";
import { Card } from "@/shared/ui/card";

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
};

/**
 * Team management page: list, invite, role/status changes for company_admin.
 */
export const TeamPage = () => {
  const t = useTranslations("Builder.team");
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get("page"));
  const pageSize = PORTAL_DEFAULT_PAGE_SIZE;
  const adminQuery = useIsCompanyAdminQuery();
  const membersQuery = useCompanyMembersQuery(
    page,
    pageSize,
    adminQuery.data === true,
  );
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  if (adminQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t("loading")}</p>;
  }

  if (adminQuery.data === false) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-secondary">{t("readOnlyNotice")}</p>
      </div>
    );
  }

  if (membersQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t("loading")}</p>;
  }

  if (
    membersQuery.isError &&
    isApiErrorStatus(membersQuery.error, 403)
  ) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-secondary">{t("readOnlyNotice")}</p>
      </div>
    );
  }

  if (membersQuery.isError || !membersQuery.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t("error")}
      </p>
    );
  }

  const response = membersQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
          <p className="text-sm text-ink-secondary">
            {t("subtitle", { count: response.meta.total })}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-9 items-center rounded-pill bg-cta-dark px-4 text-sm font-medium text-on-dark hover:bg-cta-dark/90"
          onClick={() => {
            setShowInvite((value) => !value);
            setInviteEmail(null);
          }}
        >
          {t("inviteMember")}
        </button>
      </div>

      {inviteEmail ? (
        <p role="status" className="rounded-sm bg-surface px-3 py-2 text-sm text-ink">
          {t("inviteSuccess", { email: inviteEmail })}
        </p>
      ) : null}

      {showInvite ? (
        <Card className="max-w-lg">
          <InviteMemberForm
            onSuccess={(email) => {
              setInviteEmail(email);
              setShowInvite(false);
            }}
          />
        </Card>
      ) : null}

      {response.data.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t("empty")}</p>
      ) : (
        <TeamTable members={response.data} canManage />
      )}

      <CatalogPagination
        page={response.meta.page}
        totalPages={response.meta.totalPages}
        buildHref={(nextPage) =>
          nextPage <= 1 ? "/builder/team" : `/builder/team?page=${nextPage}`
        }
        previousLabel={t("pagination.previous")}
        nextLabel={t("pagination.next")}
      />
    </div>
  );
};
