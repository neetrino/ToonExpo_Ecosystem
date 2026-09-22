'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { useAdminInventoryListFilters } from '@/features/admin/hooks/use-admin-inventory-list-filters';
import { ADMIN_INVENTORY_SEARCH_WIDTH_CLASS } from '@/features/admin/constants';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { ListPageHeader } from '@/shared/ui/list-page-header';
import type { ViewMode } from '@/shared/ui/view-mode';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const FIRST_PAGE = 1;

type AdminInventoryListShellProps = {
  title: string;
  subtitle: string;
  empty: string;
  loading: string;
  error: string;
  isLoading: boolean;
  isError: boolean;
  total: number;
  page: number;
  totalPages: number;
  children: ReactNode;
  search: string;
  onSearchChange: (value: string) => void;
  icon?: LucideIcon | undefined;
  showBuildingFilter?: boolean | undefined;
  showFloorFilter?: boolean | undefined;
  showSalesStatusFilter?: boolean | undefined;
  headerActions?: ReactNode | undefined;
  viewMode?: ViewMode | undefined;
  onViewModeChange?: ((mode: ViewMode) => void) | undefined;
};

/**
 * Shared chrome for admin inventory hubs (buildings / floors / apartments).
 */
export const AdminInventoryListShell = ({
  title,
  subtitle,
  empty,
  loading,
  error,
  isLoading,
  isError,
  total,
  page,
  totalPages,
  children,
  search,
  onSearchChange,
  icon,
  showBuildingFilter = false,
  showFloorFilter = false,
  showSalesStatusFilter = false,
  headerActions,
  viewMode,
  onViewModeChange,
}: AdminInventoryListShellProps) => {
  const t = useTranslations('Admin.projects');
  const tCommon = useTranslations('Common.integratedSearch');
  const {
    filterConfigs,
    filterValues,
    filtersLoading,
    setPanelDraftFilters,
    buildListHref,
    applyDraftFilters,
    onFilterChange,
    clearFilters,
  } = useAdminInventoryListFilters({
    page,
    showBuildingFilter,
    showFloorFilter,
    showSalesStatusFilter,
  });

  const showInitialLoading = (isLoading || filtersLoading) && total === 0 && !isError;

  return (
    <div className="flex flex-col gap-6">
      <ListPageHeader
        title={title}
        subtitle={showInitialLoading ? loading : subtitle}
        {...(icon ? { icon } : {})}
        search={search}
        searchPlaceholder={tCommon('searchPlaceholder')}
        searchAriaLabel={tCommon('searchLabel')}
        searchClassName={ADMIN_INVENTORY_SEARCH_WIDTH_CLASS}
        filters={filterConfigs}
        filterValues={filterValues}
        onSearchChange={onSearchChange}
        onDraftFilterChange={setPanelDraftFilters}
        onPanelOpenChange={(open) => {
          if (!open) {
            setPanelDraftFilters(null);
          }
        }}
        onApplyFilters={applyDraftFilters}
        onFilterChange={onFilterChange}
        onClearAll={() => {
          onSearchChange('');
          clearFilters();
        }}
        actions={
          <>
            {viewMode && onViewModeChange ? (
              <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
            ) : null}
            {headerActions}
          </>
        }
      />

      {showInitialLoading ? (
        <p className="text-sm text-ink-secondary">{loading}</p>
      ) : isError ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : (
        <>
          {total === 0 ? <p className="text-sm text-ink-secondary">{empty}</p> : children}

          <CatalogPagination
            page={page}
            totalPages={totalPages}
            previousHref={page > FIRST_PAGE ? buildListHref({ page: page - 1 }) : null}
            nextHref={page < totalPages ? buildListHref({ page: page + 1 }) : null}
            previousLabel={t('pagination.previous')}
            nextLabel={t('pagination.next')}
            ariaLabel={t('pagination.ariaLabel')}
          />
        </>
      )}
    </div>
  );
};

export { useAdminInventoryListParams } from '@/features/admin/hooks/use-admin-inventory-list-params';
