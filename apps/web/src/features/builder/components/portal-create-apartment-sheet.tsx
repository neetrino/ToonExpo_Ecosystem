'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { BulkApartmentsForm } from '@/features/builder/components/bulk-apartments-form';
import { PORTAL_MAX_PAGE_SIZE } from '@/features/builder/constants';
import {
  usePortalBuildingFloorsQuery,
  usePortalInventoryBuildingsQuery,
} from '@/features/builder/hooks/use-portal-inventory-hub';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { FormField } from '@/shared/ui/form-field';
import { ListboxSelect } from '@/shared/ui/listbox-select';

type PortalCreateApartmentSheetProps = {
  open: boolean;
  onClose: () => void;
  defaultBuildingId?: string | undefined;
};

/**
 * Builder sheet: pick building and floor, then bulk-create apartments.
 */
export const PortalCreateApartmentSheet = ({
  open,
  onClose,
  defaultBuildingId,
}: PortalCreateApartmentSheetProps) => {
  const t = useTranslations('Admin.apartments.create');
  const inventoryT = useTranslations('Admin.buildings.inventory');
  const buildingsQuery = usePortalInventoryBuildingsQuery(1, PORTAL_MAX_PAGE_SIZE);
  const [buildingId, setBuildingId] = useState(defaultBuildingId ?? '');
  const [floorId, setFloorId] = useState('');
  const floorsQuery = usePortalBuildingFloorsQuery(buildingId);

  useEffect(() => {
    if (!open) {
      return;
    }
    setBuildingId(defaultBuildingId ?? '');
    setFloorId('');
  }, [open, defaultBuildingId]);

  const buildingOptions = useMemo(() => {
    const buildings = buildingsQuery.data?.data ?? [];
    return buildings
      .slice()
      .sort((a, b) => {
        const byProject = a.projectName.localeCompare(b.projectName);
        return byProject !== 0 ? byProject : a.name.localeCompare(b.name);
      })
      .map((building) => ({
        value: building.id,
        label: `${building.name} · ${building.projectName}`,
      }));
  }, [buildingsQuery.data]);

  const selectedBuilding = (buildingsQuery.data?.data ?? []).find((row) => row.id === buildingId);
  const floorOptions = (floorsQuery.data ?? []).map((floor) => ({
    value: floor.id,
    label:
      floor.displayLabel?.trim() ||
      floor.name?.trim() ||
      inventoryT('floorCode', { number: floor.number }),
  }));

  return (
    <AdminCreateSheet open={open} onClose={onClose} title={t('title')} size="comfortable">
      <div className="flex flex-col gap-4">
        <FormField id="portal-create-apt-building" label={t('building')}>
          <ListboxSelect
            id="portal-create-apt-building"
            variant="field"
            searchable
            value={buildingId}
            disabled={buildingsQuery.isLoading}
            options={buildingOptions}
            placeholder={t('searchBuilding')}
            emptyLabel={t('noBuildingMatches')}
            aria-label={t('building')}
            onChange={(next) => {
              setBuildingId(next);
              setFloorId('');
            }}
          />
        </FormField>
        <FormField id="portal-create-apt-floor" label={t('floor')}>
          <ListboxSelect
            id="portal-create-apt-floor"
            variant="field"
            searchable
            value={floorId}
            disabled={!buildingId || floorsQuery.isLoading}
            options={floorOptions}
            placeholder={t('searchFloor')}
            emptyLabel={t('noFloorMatches')}
            aria-label={t('floor')}
            onChange={setFloorId}
          />
        </FormField>
        {selectedBuilding && floorId ? (
          <BulkApartmentsForm
            projectId={selectedBuilding.projectId}
            floorId={floorId}
            onSuccess={onClose}
          />
        ) : null}
      </div>
    </AdminCreateSheet>
  );
};
