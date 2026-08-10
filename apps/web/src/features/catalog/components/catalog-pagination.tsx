'use client';

import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import { LIST_PAGINATION_DELAY_MS, Reveal } from '@/shared/ui/motion';

type PaginationProps = {
  page: number;
  totalPages: number;
  /** Serializable href for previous page; null when unavailable. */
  previousHref: string | null;
  /** Serializable href for next page; null when unavailable. */
  nextHref: string | null;
  previousLabel: string;
  nextLabel: string;
  ariaLabel: string;
  className?: string | undefined;
};

/**
 * Simple prev/next pagination for catalog lists.
 * Hrefs are plain strings so Server Components can pass them safely.
 */
export const CatalogPagination = ({
  page,
  totalPages,
  previousHref,
  nextHref,
  previousLabel,
  nextLabel,
  ariaLabel,
  className,
}: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <Reveal force delayMs={LIST_PAGINATION_DELAY_MS}>
      <nav
        className={cn('flex items-center justify-between gap-4', className)}
        aria-label={ariaLabel}
      >
        {previousHref ? (
          <Link
            href={previousHref}
            className="rounded-sm border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-surface"
          >
            {previousLabel}
          </Link>
        ) : (
          <span className="rounded-sm border border-transparent px-4 py-2 text-sm text-ink-muted">
            {previousLabel}
          </span>
        )}

        <span className="text-sm text-ink-secondary">
          {page} / {totalPages}
        </span>

        {nextHref ? (
          <Link
            href={nextHref}
            className="rounded-sm border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-surface"
          >
            {nextLabel}
          </Link>
        ) : (
          <span className="rounded-sm border border-transparent px-4 py-2 text-sm text-ink-muted">
            {nextLabel}
          </span>
        )}
      </nav>
    </Reveal>
  );
};
