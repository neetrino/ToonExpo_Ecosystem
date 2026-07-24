'use client';

import type { MediaAssetSummary } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useMemo, useRef } from 'react';

import { AdminBuildingFloorPlansForm } from '@/features/admin/components/admin-building-floor-plans-form';
import { AdminBuildingInventoryGlanceCard } from '@/features/admin/components/admin-building-inventory-glance';
import { AdminFloorApartmentsSheet } from '@/features/admin/components/admin-floor-apartments-sheet';
import { useAdminBuildingInventoryGlanceQuery } from '@/features/admin/hooks/use-admin-inventory';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';
import { SideSheet } from '@/shared/ui/side-sheet';

type AdminBuildingInventorySheetProps = {
  buildingId: string | null;
  floorId: string | null;
  onClose: () => void;
  onSelectFloor: (floorId: string) => void;
  onCloseFloor: () => void;
};

type FloorSheetSnapshot = {
  floorId: string;
  floorLabel: string;
  floorplan: MediaAssetSummary | null;
};

/**
 * Building inventory sheet: name + status header, glance card, nested floor sheet.
 */
export const AdminBuildingInventorySheet = ({
  buildingId,
  floorId,
  onClose,
  onSelectFloor,
  onCloseFloor,
}: AdminBuildingInventorySheetProps) => {
  const t = useTranslations('Admin.buildings.inventory');
  const query = useAdminBuildingInventoryGlanceQuery(buildingId ?? '');
  const glance = query.data;
  const floorSnapshotRef = useRef<FloorSheetSnapshot | null>(null);

  const selectedFloor = useMemo(() => {
    if (!floorId || !glance) {
      return null;
    }
    return glance.floors.find((floor) => floor.id === floorId) ?? null;
  }, [floorId, glance]);

  if (selectedFloor) {
    floorSnapshotRef.current = {
      floorId: selectedFloor.id,
      floorLabel: t('floorCode', { number: selectedFloor.number }),
      floorplan: selectedFloor.floorplan,
    };
  }

  const floorSheetOpen = floorId != null;
  const floorSheetFloorId = selectedFloor?.id ?? floorSnapshotRef.current?.floorId ?? floorId ?? '';
  const floorSheetLabel =
    (selectedFloor ? t('floorCode', { number: selectedFloor.number }) : null) ??
    floorSnapshotRef.current?.floorLabel ??
    t('floorFallback');
  const floorSheetPlan = selectedFloor?.floorplan ?? floorSnapshotRef.current?.floorplan ?? null;

  const title = glance?.name ?? t('sheetTitle');
  const description = glance ? glance.projectName : undefined;

  return (
    <>
      <SideSheet
        open={buildingId != null}
        onClose={onClose}
        title={title}
        description={description}
        size="default"
        headerActions={
          glance ? (
            <PublicationStatusBadge
              status={glance.publicationStatus}
              className={LIST_STATUS_BADGE_COMPACT_CLASS}
            />
          ) : undefined
        }
      >
        {!buildingId || query.isLoading ? (
          <p className="text-sm text-ink-secondary">{t('loading')}</p>
        ) : null}

        {buildingId && (query.isError || (!query.isLoading && !glance)) ? (
          <p role="alert" className="text-sm text-danger">
            {t('error')}
          </p>
        ) : null}

        {glance ? (
          <div className="flex flex-col gap-2">
            <AdminBuildingInventoryGlanceCard glance={glance} onSelectFloor={onSelectFloor} />
            <AdminBuildingFloorPlansForm glance={glance} />
          </div>
        ) : null}
      </SideSheet>

      {glance ? (
        <AdminFloorApartmentsSheet
          open={floorSheetOpen}
          companyId={glance.builderCompanyId}
          buildingId={glance.id}
          floorId={floorSheetFloorId}
          floorLabel={floorSheetLabel}
          floorplan={floorSheetPlan}
          onClose={onCloseFloor}
        />
      ) : null}
    </>
  );
};
