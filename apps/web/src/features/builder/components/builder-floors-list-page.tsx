'use client';

import type { AdminFloorListItem } from '@toonexpo/contracts';
import { Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { AdminFloorApartmentsSheet } from '@/features/admin/components/admin-floor-apartments-sheet';
import { CopyFloorSheet } from '@/features/admin/components/copy-floor-sheet';
import { AdminFloorsTable } from '@/features/admin/components/admin-floors-table';
import { useBulkDeleteFloorsMutation } from '@/features/admin/hooks/use-inventory-bulk-delete';
import { useInventoryListSelection } from '@/features/admin/hooks/use-inventory-list-selection';
import { useAdminBuildingInventoryGlanceQuery } from '@/features/admin/hooks/use-admin-inventory';
import { PORTAL_INVENTORY_SHEET_SCOPE } from '@/features/admin/inventory-sheet-scope';
import { catalogFloorsListHref } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import {
  BuilderInventoryListShell,
  useBuilderInventoryListParams,
} from '@/features/builder/components/builder-inventory-list-shell';
import { PortalCreateFloorSheet } from '@/features/builder/components/portal-create-floor-sheet';
import { FLOORS_VIEW_MODE_KEY } from '@/features/builder/constants';
import { useIsCompanyAdmin } from '@/features/builder/hooks/use-company-profile';
import { usePortalInventoryFloorsQuery } from '@/features/builder/hooks/use-portal-inventory-hub';
import { useRouter } from '@/i18n/navigation';
import { useDebouncedSearch } from '@/shared/hooks/use-debounced-search';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { ListSelectionToolbar } from '@/shared/ui/list-selection-toolbar';

const FIRST_PAGE = 1;

/**
 * Builder floors hub — card opens apartments sheet like admin.
 */
export const BuilderFloorsListPage = () => {
  const t = useTranslations('Admin.floors');
  const inventoryT = useTranslations('Admin.buildings.inventory');
  const scope = useCatalogScope();
  const router = useRouter();
  const { page, pageSize, buildingId } = useBuilderInventoryListParams();
  const [search, setSearch] = useState('');
  const activeSearch = useDebouncedSearch(search);
  const query = usePortalInventoryFloorsQuery(
    page,
    pageSize,
    buildingId,
    activeSearch || undefined,
  );
  const response = query.data;
  const [showCreate, setShowCreate] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<AdminFloorListItem | null>(null);
  const [copyFloor, setCopyFloor] = useState<AdminFloorListItem | null>(null);
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(FLOORS_VIEW_MODE_KEY);
  const isCompanyAdmin = useIsCompanyAdmin();
  const floors = response?.data ?? [];
  const listBulk = useInventoryListSelection(floors, effectiveViewMode, {
    enabled: isCompanyAdmin,
  });
  const bulkDeleteMutation = useBulkDeleteFloorsMutation(scope);

  const glanceQuery = useAdminBuildingInventoryGlanceQuery(
    selectedFloor?.buildingId ?? '',
    PORTAL_INVENTORY_SHEET_SCOPE,
  );
  const floorplan = useMemo(() => {
    if (!selectedFloor || !glanceQuery.data) {
      return null;
    }
    return (
      glanceQuery.data.floors.find((floor) => floor.id === selectedFloor.id)?.floorplan ?? null
    );
  }, [selectedFloor, glanceQuery.data]);

  const floorLabel = selectedFloor
    ? selectedFloor.displayLabel?.trim() ||
      selectedFloor.name?.trim() ||
      inventoryT('floorCode', { number: selectedFloor.number })
    : inventoryT('floorFallback');

  const handleSearchChange = (value: string): void => {
    setSearch(value);
    if (page > FIRST_PAGE) {
      const params = new URLSearchParams();
      if (buildingId) {
        params.set('buildingId', buildingId);
      }
      const listHref = catalogFloorsListHref(scope);
      const queryString = params.toString();
      router.replace(queryString.length > 0 ? `${listHref}?${queryString}` : listHref);
    }
  };

  return (
    <>
      <BuilderInventoryListShell
        title={t('title')}
        subtitle={t('subtitle', { count: response?.meta.total ?? 0 })}
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
        icon={Layers}
        showBuildingFilter
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
            <AdminFloorsTable
              floors={response.data}
              viewMode={effectiveViewMode}
              showCompany={false}
              listSelection={listBulk.listSelection}
              onSelectFloor={setSelectedFloor}
              onCopyFloor={setCopyFloor}
            />
          </div>
        ) : null}
      </BuilderInventoryListShell>

      <PortalCreateFloorSheet
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
        }}
        defaultBuildingId={buildingId}
      />

      <CopyFloorSheet
        open={copyFloor != null}
        floor={copyFloor}
        scope={scope}
        onClose={() => {
          setCopyFloor(null);
        }}
      />

      {selectedFloor ? (
        <AdminFloorApartmentsSheet
          open
          stackLevel={0}
          companyId={selectedFloor.builderCompanyId}
          buildingId={selectedFloor.buildingId}
          floorId={selectedFloor.id}
          floorLabel={floorLabel}
          publicationStatus={selectedFloor.publicationStatus}
          floorNumber={selectedFloor.number}
          floorName={selectedFloor.name}
          floorDisplayLabel={selectedFloor.displayLabel}
          floorplan={floorplan}
          sheetScope={PORTAL_INVENTORY_SHEET_SCOPE}
          onClose={() => {
            setSelectedFloor(null);
          }}
        />
      ) : null}
    </>
  );
};
