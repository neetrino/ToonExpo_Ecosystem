import type { BuilderSummary, PublicPartnerListItem } from '@toonexpo/contracts';

import { ExhibitorCatalogPagination } from '@/features/catalog/components/exhibitor-catalog-pagination';
import { ExhibitorCatalogResults } from '@/features/catalog/components/exhibitor-catalog-results';
import { ExhibitorTypeTabs } from '@/features/catalog/components/exhibitor-type-tabs';
import type { ExhibitorTab } from '@/features/catalog/constants/exhibitor-tabs';

type ExhibitorCatalogSectionProps = {
  activeTab: ExhibitorTab;
  visibleTabs: readonly ExhibitorTab[];
  emptyLabel: string;
  builders?: readonly BuilderSummary[] | undefined;
  partners?: readonly PublicPartnerListItem[] | undefined;
  page: number;
  totalPages: number;
  previousLabel: string;
  nextLabel: string;
  paginationAriaLabel: string;
  showPagination: boolean;
  onSelectTab: (tab: ExhibitorTab) => void;
  onPageChange: (page: number) => void;
};

/**
 * Exhibitors tabs + results + optional pagination.
 */
export const ExhibitorCatalogSection = ({
  activeTab,
  visibleTabs,
  emptyLabel,
  builders,
  partners,
  page,
  totalPages,
  previousLabel,
  nextLabel,
  paginationAriaLabel,
  showPagination,
  onSelectTab,
  onPageChange,
}: ExhibitorCatalogSectionProps) => {
  return (
    <div className="page-container section-pad pt-8 sm:pt-10">
      {visibleTabs.length > 1 ? (
        <ExhibitorTypeTabs
          activeTab={activeTab}
          visibleTabs={visibleTabs}
          onSelectTab={onSelectTab}
        />
      ) : null}
      <ExhibitorCatalogResults emptyLabel={emptyLabel} builders={builders} partners={partners} />
      {showPagination ? (
        <ExhibitorCatalogPagination
          page={page}
          totalPages={totalPages}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          ariaLabel={paginationAriaLabel}
          onPageChange={onPageChange}
        />
      ) : null}
    </div>
  );
};
