import type { ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';

type ProjectCatalogSectionCardProps = {
  title: string;
  children: ReactNode;
  className?: string | undefined;
  /** Optional action aligned with the section title (e.g. Import). */
  headerAction?: ReactNode | undefined;
};

/**
 * Houzez-style white content card for project catalog sections.
 */
export const ProjectCatalogSectionCard = ({
  title,
  children,
  className,
  headerAction,
}: ProjectCatalogSectionCardProps) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-header-border bg-surface-elevated p-6 shadow-sm sm:p-8',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold tracking-tight text-ink-navy">{title}</h3>
        {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
};
