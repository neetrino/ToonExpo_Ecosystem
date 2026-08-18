import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { CATALOG_RESULTS_SCROLL_ID } from '@/features/catalog/constants/catalog-list';

type ExhibitorCatalogPaginationProps = {
  page: number;
  totalPages: number;
  previousLabel: string;
  nextLabel: string;
  ariaLabel: string;
  onPageChange: (page: number) => void;
};

/**
 * Pagination for partner-type exhibitors tabs (builders are a single unpaged list).
 */
export const ExhibitorCatalogPagination = ({
  page,
  totalPages,
  previousLabel,
  nextLabel,
  ariaLabel,
  onPageChange,
}: ExhibitorCatalogPaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <CatalogPagination
      className="mt-10"
      page={page}
      totalPages={totalPages}
      previousHref={page > 1 ? '#' : null}
      nextHref={page < totalPages ? '#' : null}
      previousLabel={previousLabel}
      nextLabel={nextLabel}
      ariaLabel={ariaLabel}
      scrollTargetId={CATALOG_RESULTS_SCROLL_ID}
      onPageChange={onPageChange}
    />
  );
};
