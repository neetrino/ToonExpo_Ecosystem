import type { ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';

type SectionHeaderProps = {
  title: string;
  description?: string | undefined;
  eyebrow?: string | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
  as?: 'h2' | 'h3' | undefined;
};

/**
 * Section heading used on marketing and catalog bands.
 * Layout matches Figma `81:171` (eyebrow + title left, action bottom-aligned right).
 */
export const SectionHeader = ({
  title,
  description,
  eyebrow,
  action,
  className,
  as: Tag = 'h2',
}: SectionHeaderProps) => {
  return (
    <div className={cn('mb-10 flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="min-w-0 max-w-3xl">
        {eyebrow ? <p className="text-eyebrow mb-2">{eyebrow}</p> : null}
        <Tag className="text-section-title">{title}</Tag>
        {description ? (
          <p className="text-body-sm mt-2.5 text-header-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
};
