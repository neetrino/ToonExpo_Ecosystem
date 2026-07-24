'use client';

import type { AdminBuildingListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { AdminBuildingInventorySheet } from '@/features/admin/components/admin-building-inventory-sheet';
import { AdminCreateBuildingSheet } from '@/features/admin/components/admin-create-building-sheet';
import {
  AdminInventoryListShell,
  useAdminInventoryListParams,
} from '@/features/admin/components/admin-inventory-list-shell';
import { useAdminBuildingsQuery } from '@/features/admin/hooks/use-admin-inventory';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { usePathname, useRouter } from '@/i18n/navigation';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';

/**
 * Admin buildings hub list with inventory glance sheet.
 */
export const AdminBuildingsListPage = () => {
  const t = useTranslations('Admin.buildings');
  const { page, pageSize, companyId } = useAdminInventoryListParams();
  const query = useAdminBuildingsQuery(page, pageSize, companyId);
  const response = query.data;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [showCreate, setShowCreate] = useState(false);

  const buildingId = searchParams.get('buildingId')?.trim() || null;
  const floorId = searchParams.get('floorId')?.trim() || null;

  const buildHref = (next: {
    page?: number;
    companyId?: string;
    buildingId?: string | null;
    floorId?: string | null;
  }): string => {
    const params = new URLSearchParams();
    const nextCompanyId = next.companyId ?? companyId;
    const nextPage = next.page ?? page;
    const nextBuildingId = next.buildingId === undefined ? buildingId : next.buildingId;
    const nextFloorId = next.floorId === undefined ? floorId : next.floorId;

    if (nextCompanyId) {
      params.set('companyId', nextCompanyId);
    }
    if (nextPage > 1) {
      params.set('page', String(nextPage));
    }
    if (nextBuildingId) {
      params.set('buildingId', nextBuildingId);
    }
    if (nextFloorId) {
      params.set('floorId', nextFloorId);
    }

    const queryString = params.toString();
    return queryString.length > 0 ? `${pathname}?${queryString}` : pathname;
  };

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
          <BuildingsTable
            buildings={response.data}
            onSelectBuilding={(id) => {
              router.replace(buildHref({ buildingId: id, floorId: null }));
            }}
          />
        ) : null}
      </AdminInventoryListShell>

      <AdminCreateBuildingSheet
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
        }}
        defaultCompanyId={companyId}
      />

      <AdminBuildingInventorySheet
        buildingId={buildingId}
        floorId={floorId}
        onClose={() => {
          router.replace(buildHref({ buildingId: null, floorId: null }));
        }}
        onSelectFloor={(id) => {
          router.replace(buildHref({ floorId: id }));
        }}
        onCloseFloor={() => {
          router.replace(buildHref({ floorId: null }));
        }}
      />
    </>
  );
};

type BuildingsTableProps = {
  buildings: AdminBuildingListItem[];
  onSelectBuilding: (buildingId: string) => void;
};

const BuildingsTable = ({ buildings, onSelectBuilding }: BuildingsTableProps) => {
  const t = useTranslations('Admin.buildings');

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {buildings.map((building) => (
        <button
          key={building.id}
          type="button"
          onClick={() => {
            onSelectBuilding(building.id);
          }}
          className="flex flex-col gap-2 rounded-lg bg-surface-elevated p-4 text-left shadow-xs transition-[box-shadow] hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="min-w-0 truncate font-semibold text-ink">{building.name}</span>
            <PublicationStatusBadge
              status={building.publicationStatus}
              className={LIST_STATUS_BADGE_COMPACT_CLASS}
            />
          </div>
          <p className="truncate text-sm text-ink-secondary">{building.projectName}</p>
          <p className="truncate text-sm text-ink-muted">{building.companyName}</p>
          <div className="flex flex-wrap gap-3 text-sm text-ink-secondary">
            <span>
              {t('columns.floors')}: {building.floorsCount}
            </span>
            <span>
              {t('columns.apartments')}: {building.apartmentsCount}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
