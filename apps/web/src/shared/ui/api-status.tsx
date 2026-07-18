import type { HealthResponse } from "@toonexpo/contracts";
import { getTranslations } from "next-intl/server";

import { cn } from "@/shared/ui/cn";

type ApiStatusProps = {
  health: HealthResponse | null;
};

const statusClassName = (status: HealthResponse["status"] | "unavailable"): string => {
  if (status === "ok") {
    return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  }
  if (status === "degraded") {
    return "bg-amber-50 text-amber-800 ring-amber-200";
  }
  return "bg-rose-50 text-rose-800 ring-rose-200";
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
      <span className="text-zinc-500">{health.service}</span>
    </div>
  );
};
