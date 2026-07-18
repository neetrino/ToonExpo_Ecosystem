"use client";

import { useLocale, useTranslations } from "next-intl";

import { CrmDealActivitiesSection } from "@/features/builder/components/crm-deal-activities-section";
import { CrmDealApartmentsSection } from "@/features/builder/components/crm-deal-apartments-section";
import { CrmDealAssigneeControl } from "@/features/builder/components/crm-deal-assignee-control";
import { CrmDealNotesSection } from "@/features/builder/components/crm-deal-notes-section";
import { CrmDealRequestsSection } from "@/features/builder/components/crm-deal-requests-section";
import { CrmDealStatusControl } from "@/features/builder/components/crm-deal-status-control";
import { useCrmDealQuery } from "@/features/builder/hooks/use-portal-crm";
import { formatBuyerDateTime } from "@/features/buyer/utils/format-datetime";
import { Link } from "@/i18n/navigation";

type CrmDealDetailPageProps = {
  dealId: string;
};

/**
 * Full CRM deal sheet: header, status, assignee, apartments, notes, activities.
 */
export const CrmDealDetailPage = ({ dealId }: CrmDealDetailPageProps) => {
  const t = useTranslations("Builder.crm");
  const locale = useLocale();
  const query = useCrmDealQuery(dealId);

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t("loading")}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t("detail.notFound")}
      </p>
    );
  }

  const deal = query.data;
  const buyerLabel =
    deal.buyer.name?.trim() ||
    deal.buyer.phone?.trim() ||
    deal.buyer.email?.trim() ||
    t("unnamedBuyer");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/builder/crm"
          className="text-sm font-medium text-ink-secondary hover:text-ink"
        >
          {t("detail.back")}
        </Link>
        <h1 className="text-xl font-semibold text-ink">{buyerLabel}</h1>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-ink-muted">{t("detail.phone")}</dt>
            <dd className="text-ink">{deal.buyer.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">{t("detail.email")}</dt>
            <dd className="text-ink">{deal.buyer.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">{t("detail.source")}</dt>
            <dd className="text-ink">{t(`sources.${deal.source}`)}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">{t("detail.created")}</dt>
            <dd className="text-ink">
              {formatBuyerDateTime(deal.createdAt, locale)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">{t("detail.project")}</dt>
            <dd className="text-ink">{deal.projectName ?? t("noProject")}</dd>
          </div>
        </dl>
        {deal.message ? (
          <p className="rounded-sm bg-surface px-3 py-2 text-sm text-ink">
            {deal.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CrmDealStatusControl deal={deal} />
        <CrmDealAssigneeControl deal={deal} />
      </div>

      <CrmDealApartmentsSection deal={deal} />
      <CrmDealNotesSection deal={deal} />
      <CrmDealActivitiesSection deal={deal} />
      <CrmDealRequestsSection deal={deal} />
    </div>
  );
};
