'use client';

import type { AdminFloorListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { AdminCreateFloorSheet } from '@/features/admin/components/admin-create-floor-sheet';
import { AdminFloorApartmentsSheet } from '@/features/admin/components/admin-floor-apartments-sheet';
import {
  AdminInventoryListShell,
  useAdminInventoryListParams,
} from '@/features/admin/components/admin-inventory-list-shell';
import {
  useAdminBuildingInventoryGlanceQuery,
  useAdminFloorsQuery,
} from '@/features/admin/hooks/use-admin-inventory';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';

/**
 * Admin floors hub — card opens a single floor apartments sheet.
 */
export const AdminFloorsListPage = () => {
  const t = useTranslations('Admin.floors');
  const inventoryT = useTranslations('Admin.buildings.inventory');
  const { page, pageSize, companyId, buildingId } = useAdminInventoryListParams();
  const query = useAdminFloorsQuery(page, pageSize, companyId, buildingId);
  const response = query.data;
  const [showCreate, setShowCreate] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<AdminFloorListItem | null>(null);

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
          <FloorsTable
            floors={response.data}
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

type FloorsTableProps = {
  floors: AdminFloorListItem[];
  onSelectFloor: (floor: AdminFloorListItem) => void;
};

const FloorsTable = ({ floors, onSelectFloor }: FloorsTableProps) => {
  const t = useTranslations('Admin.floors');

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {floors.map((floor) => {
        const label =
          floor.displayLabel?.trim() ||
          floor.name?.trim() ||
          t('floorNumber', { number: floor.number });

        return (
          <button
            key={floor.id}
            type="button"
            onClick={() => {
              onSelectFloor(floor);
            }}
            className="flex flex-col gap-2 rounded-lg bg-surface-elevated p-4 text-left shadow-xs transition-[box-shadow] hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="min-w-0 truncate font-semibold text-ink">{label}</span>
              <PublicationStatusBadge
                status={floor.publicationStatus}
                className={LIST_STATUS_BADGE_COMPACT_CLASS}
              />
            </div>
            <p className="truncate text-sm text-ink-secondary">{floor.buildingName}</p>
            <p className="truncate text-sm text-ink-muted">
              {floor.projectName} · {floor.companyName}
            </p>
            <p className="text-sm text-ink-secondary">
              {t('columns.apartments')}: {floor.apartmentsCount}
            </p>
          </button>
        );
      })}
    </div>
  );
};
