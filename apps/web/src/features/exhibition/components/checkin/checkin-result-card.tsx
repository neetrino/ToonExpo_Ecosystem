"use client";

import type { CheckInScanResponse, CheckInStatus } from "@toonexpo/contracts";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { cn } from "@/shared/ui/cn";

type CheckinResultCardProps = {
  result: CheckInScanResponse;
  onScanNext: () => void;
};

const resultTone = (
  status: CheckInStatus,
): "success" | "warning" | "danger" | "neutral" => {
  if (status === "allowed") {
    return "success";
  }
  if (status === "duplicate_checkin") {
    return "warning";
  }
  if (
    status === "denied_invalid_qr" ||
    status === "denied_blocked" ||
    status === "error"
  ) {
    return "danger";
  }
  return "neutral";
};

const toneClassName = {
  success: "border-success bg-surface text-success",
  warning: "border-brand bg-surface text-brand-secondary",
  danger: "border-danger bg-danger-soft text-danger",
  neutral: "border-border bg-surface text-ink",
} as const;

/**
 * Large scan outcome card for entrance staff.
 */
export const CheckinResultCard = ({
  result,
  onScanNext,
}: CheckinResultCardProps) => {
  const t = useTranslations("Checkin.result");
  const locale = useLocale();
  const tone = resultTone(result.status);

  const timeLabel = result.checkedInAt
    ? new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(result.checkedInAt))
    : null;

  return (
    <Card
      className={cn(
        "flex flex-col gap-4 border-2 px-4 py-6 text-center",
        toneClassName[tone],
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide">
        {t(`status.${result.status}`)}
      </p>
      {result.visitorDisplayName ? (
        <p className="text-2xl font-bold">{result.visitorDisplayName}</p>
      ) : null}
      {timeLabel ? (
        <p className="text-sm opacity-90">{t("time", { time: timeLabel })}</p>
      ) : null}
      {result.duplicateWarning ? (
        <p className="text-sm font-medium">{t("duplicateHint")}</p>
      ) : null}
      <Button type="button" variant="ghost" size="sm" onClick={onScanNext}>
        {t("scanNext")}
      </Button>
    </Card>
  );
};
