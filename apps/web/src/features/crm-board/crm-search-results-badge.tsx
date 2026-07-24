'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';

type CrmSearchResultsBadgeProps = {
  count: number;
  className?: string | undefined;
};

/**
 * Search-hit hint overlaid on the search field — out of document flow so CRM chrome does not shift.
 */
export const CrmSearchResultsBadge = ({ count, className }: CrmSearchResultsBadgeProps) => {
  const t = useTranslations('CrmBoard');

  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        'm-0 truncate whitespace-nowrap text-[11px] font-medium tracking-wide normal-case',
        count === 0 ? 'font-semibold text-warning' : 'text-brand',
        className,
      )}
    >
      {t('searchResultsCount', { count })}
    </p>
  );
};
