"use client";

import type { RecentCheckInItem } from "@toonexpo/contracts";
import { useLocale, useTranslations } from "next-intl";

import { Card } from "@/shared/ui/card";
import { cn } from "@/shared/ui/cn";

type CheckinRecentListProps = {
  items: RecentCheckInItem[];
};

const statusClassName = {
  allowed: "text-success",
  duplicate_checkin: "text-warning",
  denied_invalid_qr: "text-danger",
  denied_blocked: "text-danger",
  error: "text-danger",
} as const;

/**
 * Recent check-ins feed below the scanner.
 */
export const CheckinRecentList = ({ items }: CheckinRecentListProps) => {
  const t = useTranslations("Checkin.recent");
  const locale = useLocale();

  if (items.length === 0) {
    return (
      <p className="text-sm text-ink-secondary">{t("empty")}</p>
    );
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="divide-y divide-border p-0">
      <div className="px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">{t("title")}</h2>
      </div>
      <ul className="flex flex-col">
        {items.map((item, index) => (
          <li
            key={`${item.checkedInAt}-${index}`}
            className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">
                {item.visitorDisplayName ?? t("unknownVisitor")}
              </p>
              <p
                className={cn(
                  "text-xs font-medium",
                  statusClassName[item.status],
                )}
              >
                {t(`status.${item.status}`)}
              </p>
            </div>
            <time className="shrink-0 text-xs text-ink-muted">
              {formatter.format(new Date(item.checkedInAt))}
            </time>
          </li>
        ))}
      </ul>
    </Card>
  );
};
