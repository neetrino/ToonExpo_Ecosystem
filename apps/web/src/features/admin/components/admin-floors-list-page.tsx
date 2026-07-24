'use client';

import type { AdminFloorListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { AdminCreateFloorSheet } from '@/features/admin/components/admin-create-floor-sheet';
import { AdminFloorApartmentsSheet } from '@/features/admin/components/admin-floor-apartments-sheet';
import { AdminFloorsTable } from '@/features/admin/components/admin-floors-table';
import {
  AdminInventoryListShell,
  useAdminInventoryListParams,
} from '@/features/admin/components/admin-inventory-list-shell';
import { ADMIN_VIEW_MODE_KEYS } from '@/features/admin/constants';
import {
  useAdminBuildingInventoryGlanceQuery,
  useAdminFloorsQuery,
} from '@/features/admin/hooks/use-admin-inventory';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';

/**
 * Admin floors hub — card/list opens a single floor apartments sheet.
 */
export const AdminFloorsListPage = () => {
  const t = useTranslations('Admin.floors');
  const inventoryT = useTranslations('Admin.buildings.inventory');
  const { page, pageSize, companyId, buildingId } = useAdminInventoryListParams();
  const query = useAdminFloorsQuery(page, pageSize, companyId, buildingId);
  const response = query.data;
  const [showCreate, setShowCreate] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<AdminFloorListItem | null>(null);
  const { viewMode, setViewMode } = usePersistedViewMode(ADMIN_VIEW_MODE_KEYS.floors);

  const glanceQuery = useAdminBuildingInventoryGlanceQuery(selectedFloor?.buildingId ?? '');
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

  return (
    <>
      <AdminInventoryListShell
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
          <AdminFloorsTable
            floors={response.data}
            viewMode={viewMode}
            onSelectFloor={(floor) => {
              setSelectedFloor(floor);
            }}
          />
        ) : null}
      </AdminInventoryListShell>

      <AdminCreateFloorSheet
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
        }}
        defaultCompanyId={companyId}
        defaultBuildingId={buildingId}
      />

      {selectedFloor ? (
        <AdminFloorApartmentsSheet
          open
          stackLevel={0}
          companyId={selectedFloor.builderCompanyId}
          buildingId={selectedFloor.buildingId}
          floorId={selectedFloor.id}
          floorLabel={floorLabel}
          floorplan={floorplan}
          onClose={() => {
            setSelectedFloor(null);
          }}
        />
      ) : null}
    </>
  );
};
