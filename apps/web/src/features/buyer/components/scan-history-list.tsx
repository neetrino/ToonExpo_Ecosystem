"use client";

import type { BuyerQrScanHistoryItem } from "@toonexpo/contracts";
import { useLocale, useTranslations } from "next-intl";

import { formatBuyerDateTime } from "@/features/buyer/utils/format-datetime";
import { Card } from "@/shared/ui/card";

type ScanHistoryListProps = {
  items: BuyerQrScanHistoryItem[];
};

/**
 * Buyer-facing QR scan history (company name + time, no employee identity).
 */
export const ScanHistoryList = ({ items }: ScanHistoryListProps) => {
  const t = useTranslations("Profile.qr");
  const locale = useLocale();

  if (items.length === 0) {
    return (
      <p className="text-sm text-ink-secondary">{t("scans.empty")}</p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id}>
          <Card className="flex flex-col gap-1 !p-4 shadow-none">
            <p className="text-sm font-medium text-ink">
              {item.scannerCompanyName ?? t("scans.unknownCompany")}
            </p>
            <p className="text-xs text-ink-muted">
              {formatBuyerDateTime(item.createdAt, locale)}
            </p>
            <p className="text-xs text-ink-secondary">
              {t(`scans.context.${item.scanContext}`)}
            </p>
          </Card>
        </li>
      ))}
    </ul>
  );
};
