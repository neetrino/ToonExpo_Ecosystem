'use client';

import { Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { AdminApartmentsTable } from '@/features/admin/components/admin-apartments-table';
import { AdminCreateApartmentSheet } from '@/features/admin/components/admin-create-apartment-sheet';
import {
  AdminInventoryListShell,
  useAdminInventoryListParams,
} from '@/features/admin/components/admin-inventory-list-shell';
import { ADMIN_VIEW_MODE_KEYS } from '@/features/admin/constants';
import { useBulkDeleteApartmentsMutation } from '@/features/admin/hooks/use-inventory-bulk-delete';
import { useInventoryListSelection } from '@/features/admin/hooks/use-inventory-list-selection';
import { useAdminApartmentsQuery } from '@/features/admin/hooks/use-admin-inventory';
import { HOME_FEATURED_APARTMENT_LIMIT } from '@/features/catalog/constants/home-featured';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useDebouncedSearch } from '@/shared/hooks/use-debounced-search';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { ListSelectionToolbar } from '@/shared/ui/list-selection-toolbar';

const FIRST_PAGE = 1;

/**
 * Admin apartments hub list.
 */
export const AdminApartmentsListPage = () => {
  const t = useTranslations('Admin.apartments');
  const { page, pageSize, companyIds, buildingIds, floorIds, companyId, buildingId, salesStatus } =
    useAdminInventoryListParams();
  const [search, setSearch] = useState('');
  const activeSearch = useDebouncedSearch(search);
  const query = useAdminApartmentsQuery(
    page,
    pageSize,
    companyIds,
    buildingIds,
    activeSearch || undefined,
    floorIds,
    salesStatus,
  );
  const response = query.data;
  const [showCreate, setShowCreate] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.apartments,
  );
  const apartments = response?.data ?? [];
  const listBulk = useInventoryListSelection(apartments, effectiveViewMode, { enabled: true });
  const bulkDeleteMutation = useBulkDeleteApartmentsMutation();
  const returnTo = (() => {
    const queryString = searchParams.toString();
    return queryString.length > 0 ? `${pathname}?${queryString}` : pathname;
  })();

  const handleSearchChange = (value: string): void => {
    setSearch(value);
    if (page > FIRST_PAGE) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      const queryString = params.toString();
      router.replace(queryString.length > 0 ? `${pathname}?${queryString}` : pathname);
    }
  };

  return (
    <>
      <AdminInventoryListShell
        title={t('title')}
        subtitle={
          response
            ? t('subtitleWithFeatured', {
                count: response.meta.total,
                featured: response.meta.featuredOnHomeTotal,
                limit: HOME_FEATURED_APARTMENT_LIMIT,
              })
            : t('subtitle', { count: 0 })
        }
        empty={t('empty')}
        loading={t('loading')}
        error={t('error')}
        isLoading={query.isLoading}
        isError={query.isError || !response}
        total={response?.meta.total ?? 0}
        page={response?.meta.page ?? page}
        totalPages={response?.meta.totalPages ?? 0}
        search={search}
        onSearchChange={handleSearchChange}
        icon={Home}
        showBuildingFilter
        showFloorFilter
        showSalesStatusFilter
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        headerActions={
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              setShowCreate(true);
            }}
          >
            <AddActionLabel>{t('create.cta')}</AddActionLabel>
          </Button>
        }
      >
        {response ? (
          <div className="flex flex-col gap-3">
            <ListSelectionToolbar
              selectedCount={listBulk.selectedCount}
              onClear={listBulk.selectionClear}
              onConfirmDelete={() => bulkDeleteMutation.mutateAsync(listBulk.selectedTargets)}
            />
            <AdminApartmentsTable
              apartments={response.data}
              returnTo={returnTo}
              viewMode={effectiveViewMode}
              listSelection={listBulk.listSelection}
            />
          </div>
        ) : null}
      </AdminInventoryListShell>

      <AdminCreateApartmentSheet
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
        }}
        defaultCompanyId={companyId}
        defaultBuildingId={buildingId}
      />
    </>
  );
};
