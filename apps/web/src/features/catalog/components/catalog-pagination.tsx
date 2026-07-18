import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/ui/cn";

type PaginationProps = {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  previousLabel: string;
  nextLabel: string;
  className?: string | undefined;
};

/**
 * Simple prev/next pagination for catalog lists.
 */
export const CatalogPagination = ({
  page,
  totalPages,
  buildHref,
  previousLabel,
  nextLabel,
  className,
}: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      className={cn("flex items-center justify-between gap-4", className)}
      aria-label="Pagination"
    >
      {hasPrevious ? (
        <Link
          href={buildHref(page - 1)}
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

      {hasNext ? (
        <Link
          href={buildHref(page + 1)}
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
  );
};
