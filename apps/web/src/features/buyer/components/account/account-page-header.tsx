import type { ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';

type AccountPageHeaderProps = {
  title: string;
  subtitle?: string | undefined;
  actions?: ReactNode | undefined;
  className?: string | undefined;
  /** Heading level for the page title. */
  headingLevel?: 'h1' | 'h2' | undefined;
};

/**
 * Consistent page title block for account cabinet sections.
 */
export const AccountPageHeader = ({
  title,
  subtitle,
  actions,
  className,
  headingLevel = 'h1',
}: AccountPageHeaderProps) => {
  const HeadingTag = headingLevel;

  return (
    <div
      className={cn('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <HeadingTag className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          {title}
        </HeadingTag>
        {subtitle ? (
          <p className="max-w-2xl text-sm leading-relaxed text-ink-secondary">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
};
