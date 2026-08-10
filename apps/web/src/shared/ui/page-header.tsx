import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';
import { PageTitleBlock } from '@/shared/ui/page-title-icon';

type PageHeaderProps = {
  title: string;
  description?: string | undefined;
  eyebrow?: string | undefined;
  icon?: LucideIcon | undefined;
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
  icon,
  actions,
  className,
}: PageHeaderProps) => {
  return (
    <div
      className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}
    >
      <div className="min-w-0">
        {eyebrow ? <p className="text-eyebrow mb-2">{eyebrow}</p> : null}
        <PageTitleBlock
          title={title}
          {...(description ? { subtitle: description } : {})}
          {...(icon ? { icon } : {})}
        />
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
};
