"use client";

import type { CheckInSummaryResponse } from "@toonexpo/contracts";
import { useLocale, useTranslations } from "next-intl";

import { Card } from "@/shared/ui/card";

type AdminCheckinSummaryPanelProps = {
  summary: CheckInSummaryResponse;
};

/**
 * Check-in attendance totals and per-day breakdown for an event.
 */
export const AdminCheckinSummaryPanel = ({
  summary,
}: AdminCheckinSummaryPanelProps) => {
  const t = useTranslations("Admin.events.checkInSummary");
  const locale = useLocale();
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-ink">{t("title")}</h2>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryStat label={t("allowed")} value={summary.allowedCount} />
        <SummaryStat label={t("unique")} value={summary.uniqueVisitors} />
        <SummaryStat label={t("duplicates")} value={summary.duplicateAttempts} />
        <SummaryStat label={t("denied")} value={summary.deniedCount} />
      </dl>
      {summary.perDay.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-ink-muted">
                <th className="px-2 py-2">{t("day")}</th>
                <th className="px-2 py-2">{t("allowed")}</th>
                <th className="px-2 py-2">{t("duplicates")}</th>
                <th className="px-2 py-2">{t("denied")}</th>
              </tr>
            </thead>
            <tbody>
              {summary.perDay.map((row) => (
                <tr key={row.date} className="border-b border-border last:border-0">
                  <td className="px-2 py-2">{dateFormatter.format(new Date(row.date))}</td>
                  <td className="px-2 py-2">{row.allowedCount}</td>
                  <td className="px-2 py-2">{row.duplicateAttempts}</td>
                  <td className="px-2 py-2">{row.deniedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-ink-secondary">{t("noDays")}</p>
      )}
    </Card>
  );
};

type SummaryStatProps = {
  label: string;
  value: number;
};

const SummaryStat = ({ label, value }: SummaryStatProps) => (
  <div className="rounded-sm border border-border bg-surface px-3 py-2">
    <dt className="text-xs text-ink-muted">{label}</dt>
    <dd className="text-lg font-semibold text-ink">{value}</dd>
  </div>
);
