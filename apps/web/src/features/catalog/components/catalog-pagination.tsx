'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

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

const NAV_CONTROL_CLASS =
  'inline-flex h-10 items-center gap-1.5 rounded-[15px] px-3.5 text-sm font-medium tracking-tight';

type PaginationControlProps = {
  href: string | null;
  label: string;
  side: 'previous' | 'next';
};

const PaginationControl = ({ href, label, side }: PaginationControlProps) => {
  const icon =
    side === 'previous' ? (
      <ChevronLeft className="size-4 shrink-0" aria-hidden strokeWidth={2.25} />
    ) : (
      <ChevronRight className="size-4 shrink-0" aria-hidden strokeWidth={2.25} />
    );
  const content: ReactNode =
    side === 'previous' ? (
      <>
        {icon}
        <span className="max-sm:sr-only">{label}</span>
      </>
    ) : (
      <>
        <span className="max-sm:sr-only">{label}</span>
        {icon}
      </>
    );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          NAV_CONTROL_CLASS,
          'text-ink transition-[color,background-color,box-shadow,transform]',
          'duration-[var(--duration-fast)] ease-[var(--ease-out-premium)]',
          'hover:bg-brand-soft hover:text-brand-deep',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
          'active:scale-[0.98]',
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <span
      className={cn(NAV_CONTROL_CLASS, 'cursor-not-allowed text-ink-muted/55')}
      aria-disabled="true"
    >
      {content}
    </span>
  );
};

/**
 * Prev / page / next control for catalog and portal lists.
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
      <nav className={cn('flex justify-center', className)} aria-label={ariaLabel}>
        <div
          className={cn(
            'inline-flex items-center gap-1 rounded-[20px] border border-border/80',
            'bg-surface-elevated/95 p-1.5 shadow-sm backdrop-blur-sm',
          )}
        >
          <PaginationControl href={previousHref} label={previousLabel} side="previous" />

          <p
            className={cn(
              'min-w-[4.75rem] rounded-[15px] bg-brand-soft px-3.5 py-2 text-center',
              'text-sm font-semibold tabular-nums tracking-tight text-brand-deep',
            )}
            aria-current="page"
          >
            <span>{page}</span>
            <span className="mx-1 font-medium text-brand/45" aria-hidden>
              /
            </span>
            <span className="font-medium text-brand-secondary/80">{totalPages}</span>
          </p>

          <PaginationControl href={nextHref} label={nextLabel} side="next" />
        </div>
      </nav>
    </Reveal>
  );
};
