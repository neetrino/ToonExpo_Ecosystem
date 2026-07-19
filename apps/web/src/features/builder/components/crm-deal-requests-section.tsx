"use client";

import type { CrmDealDetail } from "@toonexpo/contracts";
import { useLocale, useTranslations } from "next-intl";

import { formatBuyerDateTime } from "@/features/buyer/utils/format-datetime";

type CrmDealRequestsSectionProps = {
  deal: CrmDealDetail;
};

/**
 * Request / intake history on a deal.
 */
export const CrmDealRequestsSection = ({
  deal,
}: CrmDealRequestsSectionProps) => {
  const t = useTranslations("Builder.crm");
  const locale = useLocale();

  return (
    <section className="flex flex-col gap-3 rounded-sm border border-border p-4">
      <h2 className="text-sm font-semibold text-ink">
        {t("detail.requestsTitle")}
      </h2>
      {deal.requests.length === 0 ? (
        <p className="text-sm text-ink-muted">{t("detail.requestsEmpty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {deal.requests.map((request) => (
            <li
              key={request.id}
              className="rounded-sm bg-surface px-3 py-2 text-sm"
            >
              <p className="font-medium text-ink">
                {t(`sources.${request.source}`)}
              </p>
              {request.note ? (
                <p className="mt-1 text-ink-secondary whitespace-pre-wrap">
                  {request.note}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-ink-muted">
                {formatBuyerDateTime(request.createdAt, locale)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
