import type { ReactNode } from "react";

import { Card } from "@/shared/ui/card";

type AnalyticsSectionCardProps = {
  title: string;
  children: ReactNode;
  empty?: boolean;
  emptyLabel?: string;
};

/**
 * Section wrapper with title and optional empty state.
 */
export const AnalyticsSectionCard = ({
  title,
  children,
  empty = false,
  emptyLabel,
}: AnalyticsSectionCardProps) => (
  <Card className="flex flex-col gap-4 p-4 sm:p-5">
    <h2 className="text-sm font-semibold text-ink">{title}</h2>
    {empty && emptyLabel ? (
      <p className="text-sm text-ink-secondary">{emptyLabel}</p>
    ) : (
      children
    )}
  </Card>
);
