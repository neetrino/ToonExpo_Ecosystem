'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';

type CrmSearchResultsBadgeProps = {
  count: number;
  className?: string | undefined;
};

/**
 * Visible search-hit summary under the CRM leads search field.
 */
export const CrmSearchResultsBadge = ({ count, className }: CrmSearchResultsBadgeProps) => {
  const t = useTranslations('CrmBoard');

  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex w-fit max-w-full items-center gap-2 rounded-pill',
        'px-3 py-1.5 text-sm font-semibold shadow-xs ring-1',
        count === 0
          ? 'bg-surface text-ink-secondary ring-border'
          : 'bg-brand-soft text-brand-deep ring-brand/20',
        className,
      )}
    >
      {count > 0 ? (
        <span
          className="inline-flex min-w-6 items-center justify-center rounded-pill bg-brand px-1.5 py-0.5 text-xs font-bold text-white"
          aria-hidden
        >
          {count}
        </span>
      ) : null}
      <span className="truncate">
        {count === 0 ? t('searchResultsCount', { count: 0 }) : t('searchResultsLabel', { count })}
      </span>
    </p>
  );
};
