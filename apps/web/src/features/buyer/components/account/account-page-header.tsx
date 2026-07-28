'use client';

import type { ReactNode } from 'react';

import { AccountMobileBackLink } from '@/features/buyer/components/account/account-mobile-back-link';
import { useAccountMobileStackBack } from '@/features/buyer/components/account/account-mobile-stack-context';
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
 * On mobile sheets, back arrow sits above the title.
 */
export const AccountPageHeader = ({
  title,
  subtitle,
  actions,
  className,
  headingLevel = 'h1',
}: AccountPageHeaderProps) => {
  const HeadingTag = headingLevel;
  const onBack = useAccountMobileStackBack();

  return (
    <div
      className={cn('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}
    >
      <div className="flex min-w-0 flex-col gap-1">
        {onBack ? <AccountMobileBackLink onBack={onBack} className="-ml-2 mb-3 md:hidden" /> : null}
        <HeadingTag className="text-page-title min-w-0 text-ink">{title}</HeadingTag>
        {subtitle ? (
          <p className="max-w-2xl text-sm leading-relaxed text-ink-secondary">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
};
