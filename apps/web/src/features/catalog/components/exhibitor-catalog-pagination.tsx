import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { CATALOG_RESULTS_SCROLL_ID } from '@/features/catalog/constants/catalog-list';

type ExhibitorCatalogPaginationProps = {
  page: number;
  totalPages: number;
  previousHref: string | null;
  nextHref: string | null;
  previousLabel: string;
  nextLabel: string;
  ariaLabel: string;
};

/**
 * Pagination for partner-type exhibitors tabs (builders are a single unpaged list).
 */
export const ExhibitorCatalogPagination = ({
  page,
  totalPages,
  previousHref,
  nextHref,
  previousLabel,
  nextLabel,
  ariaLabel,
}: ExhibitorCatalogPaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <CatalogPagination
      className="mt-10"
      page={page}
      totalPages={totalPages}
      previousHref={previousHref}
      nextHref={nextHref}
      previousLabel={previousLabel}
      nextLabel={nextLabel}
      ariaLabel={ariaLabel}
      scrollTargetId={CATALOG_RESULTS_SCROLL_ID}
    />
  );
};
