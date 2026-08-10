import type { ReactNode } from 'react';

import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/ui/cn';

type AnalyticsSectionCardProps = {
  title: string;
  children: ReactNode;
  empty?: boolean;
  emptyLabel?: string;
  action?: ReactNode;
  className?: string | undefined;
};

/**
 * Section wrapper with title and optional empty state.
 */
export const AnalyticsSectionCard = ({
  title,
  children,
  empty = false,
  emptyLabel,
  action,
  className,
}: AnalyticsSectionCardProps) => (
  <Card
    variant="elevated"
    padding="none"
    className={cn('flex flex-col gap-4 p-4 sm:p-5', className)}
  >
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      {action}
    </div>
    {empty && emptyLabel ? (
      <p className="text-sm text-ink-secondary">{emptyLabel}</p>
    ) : (
      children
    )}
  </Card>
);
