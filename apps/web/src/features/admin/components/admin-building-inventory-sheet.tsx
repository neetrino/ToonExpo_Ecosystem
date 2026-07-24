'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { AdminBuildingInventoryGlanceCard } from '@/features/admin/components/admin-building-inventory-glance';
import { AdminFloorApartmentsSheet } from '@/features/admin/components/admin-floor-apartments-sheet';
import { useAdminBuildingInventoryGlanceQuery } from '@/features/admin/hooks/use-admin-inventory';
import { SideSheet } from '@/shared/ui/side-sheet';

type AdminBuildingInventorySheetProps = {
  buildingId: string | null;
  floorId: string | null;
  onClose: () => void;
  onSelectFloor: (floorId: string) => void;
  onCloseFloor: () => void;
};

/**
 * Buildings & inventory sheet: glance card + nested floor apartments sheet.
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

  const selectedFloor = useMemo(() => {
    if (!floorId || !glance) {
      return null;
    }
    return glance.floors.find((floor) => floor.id === floorId) ?? null;
  }, [floorId, glance]);

  const floorLabel = selectedFloor
    ? selectedFloor.displayLabel?.trim() ||
      selectedFloor.name?.trim() ||
      t('floorCode', { number: selectedFloor.number })
    : t('floorFallback');

  return (
    <>
      <SideSheet
        open={buildingId != null}
        onClose={onClose}
        title={t('sheetTitle')}
        description={glance ? `${glance.name} · ${glance.projectName}` : undefined}
        size="default"
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
          <AdminBuildingInventoryGlanceCard glance={glance} onSelectFloor={onSelectFloor} />
        ) : null}
      </SideSheet>

      {glance && floorId && selectedFloor ? (
        <AdminFloorApartmentsSheet
          open
          companyId={glance.builderCompanyId}
          floorId={floorId}
          floorLabel={floorLabel}
          onClose={onCloseFloor}
        />
      ) : null}
    </>
  );
};
