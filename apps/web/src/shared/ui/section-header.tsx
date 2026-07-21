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
    <div className={cn('mb-9 flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? <p className="text-eyebrow mb-2.5">{eyebrow}</p> : null}
        <Tag className="text-section-title text-ink">{title}</Tag>
        {description ? (
          <p className="text-body-sm mt-2.5 text-ink-secondary">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
};
