'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, type MouseEvent, type ReactNode } from 'react';

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
  /**
   * Element id to bring into view after page change (e.g. results grid).
   * Skips the default jump to the document top.
   */
  scrollTargetId?: string | undefined;
  /** Client-side page change — skips a full App Router navigation. */
  onPageChange?: ((page: number) => void) | undefined;
};

const NAV_CONTROL_CLASS =
  'inline-flex h-10 items-center gap-1.5 rounded-[15px] px-3.5 text-sm font-medium tracking-tight';

const withScrollHash = (href: string | null, scrollTargetId: string | undefined): string | null => {
  if (href == null || scrollTargetId == null || scrollTargetId.length === 0) {
    return href;
  }
  if (href.includes('#')) {
    return href;
  }
  return `${href}#${scrollTargetId}`;
};

type PaginationControlProps = {
  href: string | null;
  label: string;
  side: 'previous' | 'next';
  /** When true, Next.js will not scroll to the document top. */
  preserveScroll: boolean;
  targetPage: number;
  onPageChange?: ((page: number) => void) | undefined;
};

const handlePageClick = (
  event: MouseEvent<HTMLAnchorElement>,
  targetPage: number,
  onPageChange: ((page: number) => void) | undefined,
): void => {
  if (onPageChange == null) {
    return;
  }
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
    return;
  }
  event.preventDefault();
  onPageChange(targetPage);
};

const PaginationControl = ({
  href,
  label,
  side,
  preserveScroll,
  targetPage,
  onPageChange,
}: PaginationControlProps) => {
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
        scroll={!preserveScroll}
        onClick={(event) => handlePageClick(event, targetPage, onPageChange)}
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
  scrollTargetId,
  onPageChange,
}: PaginationProps) => {
  const preserveScroll = Boolean(scrollTargetId);

  useEffect(() => {
    if (!scrollTargetId) {
      return;
    }
    if (window.location.hash !== `#${scrollTargetId}`) {
      return;
    }
    const target = document.getElementById(scrollTargetId);
    if (!target) {
      return;
    }
    const frameId = window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [page, scrollTargetId]);

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
          <PaginationControl
            href={withScrollHash(previousHref, scrollTargetId)}
            label={previousLabel}
            side="previous"
            preserveScroll={preserveScroll}
            targetPage={page - 1}
            onPageChange={onPageChange}
          />

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

          <PaginationControl
            href={withScrollHash(nextHref, scrollTargetId)}
            label={nextLabel}
            side="next"
            preserveScroll={preserveScroll}
            targetPage={page + 1}
            onPageChange={onPageChange}
          />
        </div>
      </nav>
    </Reveal>
  );
};
