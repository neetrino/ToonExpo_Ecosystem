import type { ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';

type PageHeaderProps = {
  title: string;
  description?: string | undefined;
  eyebrow?: string | undefined;
  actions?: ReactNode | undefined;
  className?: string | undefined;
};

/**
 * Consistent page title block for portals and public workspaces.
 */
export const PageHeader = ({
  title,
  description,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) => {
  return (
    <div
      className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}
    >
      <div className="min-w-0">
        {eyebrow ? <p className="text-eyebrow mb-2">{eyebrow}</p> : null}
        <h1 className="text-page-title text-ink">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
};
