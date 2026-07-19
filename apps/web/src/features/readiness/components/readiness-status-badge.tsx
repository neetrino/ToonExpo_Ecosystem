import type { ReadinessScoreStatus } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";

import { cn } from "@/shared/ui/cn";

type ReadinessStatusBadgeProps = {
  status: ReadinessScoreStatus;
  namespace: "Admin.readiness" | "Builder.readiness";
};

const statusClassName: Record<ReadinessScoreStatus, string> = {
  not_started: "bg-surface text-ink-muted",
  needs_improvement: "bg-danger/10 text-danger",
  in_progress: "bg-brand/10 text-brand",
  ready: "bg-success/10 text-success",
  blocked: "bg-warning/10 text-warning",
};

/**
 * Compact pill badge for readiness score statuses.
 */
export const ReadinessStatusBadge = ({
  status,
  namespace,
}: ReadinessStatusBadgeProps) => {
  const t = useTranslations(namespace);

  return (
    <span
      className={cn(
        "inline-flex rounded-pill px-2.5 py-0.5 text-xs font-medium",
        statusClassName[status],
      )}
    >
      {t(`statuses.${status}`)}
    </span>
  );
};
