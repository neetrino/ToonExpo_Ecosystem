import type { ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';

type ProjectCatalogSectionCardProps = {
  title: string;
  children: ReactNode;
  className?: string | undefined;
};

/**
 * Houzez-style white content card for project catalog sections.
 */
export const ProjectCatalogSectionCard = ({
  title,
  children,
  className,
}: ProjectCatalogSectionCardProps) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-header-border bg-surface-elevated p-6 shadow-sm sm:p-8',
        className,
      )}
    >
      <h3 className="text-xl font-semibold tracking-tight text-ink-navy">{title}</h3>
      <div className="mt-5">{children}</div>
    </div>
  );
};
