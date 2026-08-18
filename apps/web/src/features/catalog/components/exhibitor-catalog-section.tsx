import type { BuilderSummary, PublicPartnerListItem } from '@toonexpo/contracts';

import { ExhibitorCatalogPagination } from '@/features/catalog/components/exhibitor-catalog-pagination';
import { ExhibitorCatalogResults } from '@/features/catalog/components/exhibitor-catalog-results';
import { ExhibitorTypeTabs } from '@/features/catalog/components/exhibitor-type-tabs';
import type { ExhibitorTab } from '@/features/catalog/constants/exhibitor-tabs';

type ExhibitorCatalogSectionProps = {
  activeTab: ExhibitorTab;
  emptyLabel: string;
  builders?: readonly BuilderSummary[] | undefined;
  partners?: readonly PublicPartnerListItem[] | undefined;
  page: number;
  totalPages: number;
  previousHref: string | null;
  nextHref: string | null;
  previousLabel: string;
  nextLabel: string;
  paginationAriaLabel: string;
  showPagination: boolean;
};

/**
 * Exhibitors tabs + results + optional pagination.
 */
export const ExhibitorCatalogSection = ({
  activeTab,
  emptyLabel,
  builders,
  partners,
  page,
  totalPages,
  previousHref,
  nextHref,
  previousLabel,
  nextLabel,
  paginationAriaLabel,
  showPagination,
}: ExhibitorCatalogSectionProps) => {
  return (
    <div className="page-container section-pad pt-8 sm:pt-10">
      <ExhibitorTypeTabs activeTab={activeTab} />
      <ExhibitorCatalogResults emptyLabel={emptyLabel} builders={builders} partners={partners} />
      {showPagination ? (
        <ExhibitorCatalogPagination
          page={page}
          totalPages={totalPages}
          previousHref={previousHref}
          nextHref={nextHref}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          ariaLabel={paginationAriaLabel}
        />
      ) : null}
    </div>
  );
};
