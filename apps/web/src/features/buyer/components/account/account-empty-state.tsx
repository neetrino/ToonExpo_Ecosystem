import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/ui/cn';

type AccountEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode | undefined;
  className?: string | undefined;
};

/**
 * Centered empty-state surface for account lists.
 */
export const AccountEmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}: AccountEmptyStateProps) => {
  return (
    <Card
      variant="elevated"
      className={cn('flex flex-col items-center gap-4 px-6 py-10 text-center', className)}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="flex max-w-sm flex-col gap-1.5">
        <p className="text-base font-semibold text-ink">{title}</p>
        <p className="text-sm leading-relaxed text-ink-secondary">{description}</p>
      </div>
      {action}
    </Card>
  );
};
