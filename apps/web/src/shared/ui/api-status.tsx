import type { HealthResponse } from "@toonexpo/contracts";
import { getTranslations } from "next-intl/server";

import { cn } from "@/shared/ui/cn";

type ApiStatusProps = {
  health: HealthResponse | null;
};

const statusClassName = (status: HealthResponse["status"] | "unavailable"): string => {
  if (status === "ok") {
    return "bg-success/10 text-success ring-success/30";
  }
  if (status === "degraded") {
    return "bg-surface-input text-ink-secondary ring-border-strong";
  }
  return "bg-danger-soft text-danger ring-danger/20";
};

/**
 * Server-rendered NestJS health status block for the Sprint 0 home shell.
 */
export const ApiStatus = async ({ health }: ApiStatusProps) => {
  const t = await getTranslations("HomePage");

  if (!health) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-inset",
          statusClassName("unavailable"),
        )}
      >
        <span className="font-medium">{t("apiStatusLabel")}</span>
        <span>{t("apiUnavailable")}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-inset",
        statusClassName(health.status),
      )}
    >
      <span className="font-medium">{t("apiStatusLabel")}</span>
      <span className="uppercase tracking-wide">{health.status}</span>
      <span className="text-ink-muted">{health.service}</span>
    </div>
  );
};
