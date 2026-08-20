'use client';

import type { MediaAssetSummary, PublicationStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AdminBuildingFloorPlansForm } from '@/features/admin/components/admin-building-floor-plans-form';
import { AdminBuildingInventoryGlanceCard } from '@/features/admin/components/admin-building-inventory-glance';
import { AdminFloorApartmentsSheet } from '@/features/admin/components/admin-floor-apartments-sheet';
import { AdminInventorySheetDelete } from '@/features/admin/components/admin-inventory-sheet-delete';
import {
  useAdminBuildingInventoryGlanceQuery,
  useAdminDeleteBuildingMutation,
} from '@/features/admin/hooks/use-admin-inventory';
import { toCatalogPublicationStatus } from '@/features/catalog/utils/catalog-publication-status';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';
import { SideSheet } from '@/shared/ui/side-sheet';

type AdminBuildingInventorySheetProps = {
  buildingId: string | null;
  floorId: string | null;
  onClose: () => void;
  onSelectFloor: (floorId: string) => void;
  onCloseFloor: () => void;
  /** Nested under project buildings sheet = 1; standalone from buildings hub = 0. */
  stackLevel?: number | undefined;
};

type FloorSheetSnapshot = {
  floorId: string;
  floorLabel: string;
  publicationStatus: PublicationStatus;
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
  stackLevel = 0,
}: AdminBuildingInventorySheetProps) => {
  const t = useTranslations('Admin.buildings.inventory');
  const query = useAdminBuildingInventoryGlanceQuery(buildingId ?? '');
  const glance = query.data;
  const floorSnapshotRef = useRef<FloorSheetSnapshot | null>(null);
  const deleteMutation = useAdminDeleteBuildingMutation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setConfirmDelete(false);
    setDeleteError(null);
  }, [buildingId]);

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
      publicationStatus: selectedFloor.publicationStatus,
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
  const floorSheetStatus =
    selectedFloor?.publicationStatus ?? floorSnapshotRef.current?.publicationStatus ?? 'draft';

  const title = glance?.name ?? t('sheetTitle');
  const description = glance ? glance.projectName : undefined;
  const canDelete =
    glance != null && toCatalogPublicationStatus(glance.publicationStatus) === 'draft';
  const deleting = deleteMutation.isPending;

  const runDelete = (): void => {
    if (!glance) {
      return;
    }
    setDeleteError(null);
    void deleteMutation
      .mutateAsync({ companyId: glance.builderCompanyId, buildingId: glance.id })
      .then(() => {
        setConfirmDelete(false);
        onClose();
      })
      .catch(() => {
        setDeleteError(t('deleteError'));
      });
  };

  return (
    <>
      <SideSheet
        open={buildingId != null}
        onClose={onClose}
        title={title}
        description={description}
        size="default"
        stackLevel={stackLevel}
        escapeEnabled={!confirmDelete}
        headerActions={
          glance ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <PublicationStatusBadge
                status={glance.publicationStatus}
                className={LIST_STATUS_BADGE_COMPACT_CLASS}
              />
              {canDelete ? (
                <AdminInventorySheetDelete
                  confirmTitle={t('deleteBuildingTitle')}
                  confirmMessage={t('deleteBuildingConfirm')}
                  open={confirmDelete}
                  busy={deleting}
                  onOpen={() => {
                    setDeleteError(null);
                    setConfirmDelete(true);
                  }}
                  onCancel={() => {
                    if (!deleting) {
                      setConfirmDelete(false);
                    }
                  }}
                  onConfirm={runDelete}
                />
              ) : null}
            </div>
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

        {deleteError ? (
          <p role="alert" className="text-sm text-danger">
            {deleteError}
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
          publicationStatus={floorSheetStatus}
          floorplan={floorSheetPlan}
          stackLevel={stackLevel + 1}
          onClose={onCloseFloor}
        />
      ) : null}
    </>
  );
};
