"use client";

import type { BuyerFacingRequestStatus, BuyerRequestListItem } from "@toonexpo/contracts";
import { useLocale, useTranslations } from "next-intl";

import { useBuyerRequestsQuery } from "@/features/buyer/hooks/use-buyer";
import { formatBuyerDateTime } from "@/features/buyer/utils/format-datetime";
import { Link } from "@/i18n/navigation";
import { Card } from "@/shared/ui/card";

const statusKey = (
  status: BuyerFacingRequestStatus,
): `status.${BuyerFacingRequestStatus}` => `status.${status}`;

type RequestRowProps = {
  item: BuyerRequestListItem;
};

const RequestRow = ({ item }: RequestRowProps) => {
  const t = useTranslations("Profile.requests");
  const locale = useLocale();
  const title = item.projectName ?? item.builderCompanyName;

  return (
    <Card className="flex flex-col gap-2 !p-4 shadow-none">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <span className="shrink-0 rounded-sm bg-background px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-ink-secondary">
          {t(statusKey(item.buyerStatus))}
        </span>
      </div>
      <p className="text-xs text-ink-secondary">{item.builderCompanyName}</p>
      {item.apartmentId ? (
        <p className="text-xs text-ink-muted">{t("apartmentLinked")}</p>
      ) : null}
      <p className="text-xs text-ink-muted">
        {formatBuyerDateTime(item.createdAt, locale)}
      </p>
    </Card>
  );
};

/**
 * Buyer request / interest history list with empty catalog CTA.
 */
export const BuyerRequestsList = () => {
  const t = useTranslations("Profile.requests");
  const query = useBuyerRequestsQuery(1);

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t("loading")}</p>;
  }

  if (query.isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t("error")}
      </p>
    );
  }

  const items = query.data?.data ?? [];

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-4 rounded-md bg-surface p-6 text-center">
        <p className="text-sm text-ink-secondary">{t("empty")}</p>
        <Link
          href="/projects"
          className="text-sm font-semibold text-brand hover:underline"
        >
          {t("browseCatalog")}
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.requestId}>
          <RequestRow item={item} />
        </li>
      ))}
    </ul>
  );
};
