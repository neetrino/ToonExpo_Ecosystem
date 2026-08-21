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
  titleClassName?: string | undefined;
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
  titleClassName,
}: AnalyticsSectionCardProps) => (
  <Card
    variant="elevated"
    padding="none"
    className={cn(
      'flex flex-col gap-4 p-4 sm:p-5',
      'transition-[translate,box-shadow] duration-[750ms]',
      'ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
      'hover:-translate-y-1 hover:shadow-md',
      'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
      className,
    )}
  >
    <div className="flex items-center justify-between gap-3">
      <h2 className={cn('text-sm font-semibold text-ink', titleClassName)}>{title}</h2>
      {action}
    </div>
    {empty && emptyLabel ? (
      <p className="text-sm text-ink-secondary">{emptyLabel}</p>
    ) : (
      children
    )}
  </Card>
);
