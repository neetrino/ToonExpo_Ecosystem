'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';

type CrmSearchResultsBadgeProps = {
  count: number;
  className?: string | undefined;
};

/**
 * Quiet search-hit hint — sits beside the search label, no layout shift.
 */
export const CrmSearchResultsBadge = ({ count, className }: CrmSearchResultsBadgeProps) => {
  const t = useTranslations('CrmBoard');

  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        'm-0 truncate text-[11px] font-medium tracking-wide normal-case',
        count === 0 ? 'font-semibold text-warning' : 'text-brand',
        className,
      )}
    >
      {t('searchResultsCount', { count })}
    </p>
  );
};
