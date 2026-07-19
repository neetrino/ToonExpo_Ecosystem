"use client";

import { useTranslations } from "next-intl";

import { PORTAL_MAX_PAGE_SIZE } from "@/features/builder/constants";
import { useCrmDealsQuery } from "@/features/builder/hooks/use-portal-crm";
import { aggregateCrmDashboardStats } from "@/features/builder/utils/crm-dashboard-stats";
import { CRM_OPEN_DEAL_STATUSES } from "@/features/builder/utils/crm-status-transitions";
import { Link } from "@/i18n/navigation";
import { Card } from "@/shared/ui/card";

/**
 * Dashboard widget: open deals by status + created today.
 */
export const CrmDashboardWidget = () => {
  const t = useTranslations("Builder.dashboard.crm");
  const tStatus = useTranslations("Builder.crm");
  const query = useCrmDealsQuery({ page: 1, pageSize: PORTAL_MAX_PAGE_SIZE });

  if (query.isLoading) {
    return (
      <Card className="p-4 sm:p-5">
        <p className="text-sm text-ink-secondary">{t("loading")}</p>
      </Card>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Card className="p-4 sm:p-5">
        <p role="alert" className="text-sm text-danger">
          {t("error")}
        </p>
      </Card>
    );
  }

  const stats = aggregateCrmDashboardStats(query.data.data);

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">{t("title")}</h2>
          <p className="mt-1 text-sm text-ink-secondary">{t("subtitle")}</p>
        </div>
        <Link
          href="/builder/crm"
          className="text-sm font-medium text-brand hover:underline"
        >
          {t("openCrm")}
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-muted">
            {t("openTotal")}
          </p>
          <p className="mt-1 text-2xl font-semibold text-ink">{stats.openTotal}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-muted">
            {t("createdToday")}
          </p>
          <p className="mt-1 text-2xl font-semibold text-ink">
            {stats.createdToday}
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5">
        {CRM_OPEN_DEAL_STATUSES.map((status) => {
          const count = stats.openByStatus[status];
          if (count === 0) {
            return null;
          }
          return (
            <li
              key={status}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-ink-secondary">
                {tStatus(`statuses.${status}`)}
              </span>
              <span className="font-medium text-ink">{count}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};
