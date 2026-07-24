'use client';

import type { AdminFloorListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AdminBuildingInventorySheet } from '@/features/admin/components/admin-building-inventory-sheet';
import { AdminCreateFloorSheet } from '@/features/admin/components/admin-create-floor-sheet';
import {
  AdminInventoryListShell,
  useAdminInventoryListParams,
} from '@/features/admin/components/admin-inventory-list-shell';
import { useAdminFloorsQuery } from '@/features/admin/hooks/use-admin-inventory';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';

/**
 * Admin floors hub list — card opens the same building inventory sheet.
 */
export const AdminFloorsListPage = () => {
  const t = useTranslations('Admin.floors');
  const { page, pageSize, companyId, buildingId } = useAdminInventoryListParams();
  const query = useAdminFloorsQuery(page, pageSize, companyId, buildingId);
  const response = query.data;
  const [showCreate, setShowCreate] = useState(false);
  const [sheetBuildingId, setSheetBuildingId] = useState<string | null>(null);
  const [sheetFloorId, setSheetFloorId] = useState<string | null>(null);

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
              setSheetBuildingId(floor.buildingId);
              setSheetFloorId(null);
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

      <AdminBuildingInventorySheet
        buildingId={sheetBuildingId}
        floorId={sheetFloorId}
        onClose={() => {
          setSheetBuildingId(null);
          setSheetFloorId(null);
        }}
        onSelectFloor={(id) => {
          setSheetFloorId(id);
        }}
        onCloseFloor={() => {
          setSheetFloorId(null);
        }}
      />
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
