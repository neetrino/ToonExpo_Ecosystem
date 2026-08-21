'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { AddFloorForm } from '@/features/builder/components/add-floor-form';
import { PORTAL_MAX_PAGE_SIZE } from '@/features/builder/constants';
import { usePortalInventoryBuildingsQuery } from '@/features/builder/hooks/use-portal-inventory-hub';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { FormField } from '@/shared/ui/form-field';
import { ListboxSelect } from '@/shared/ui/listbox-select';

type PortalCreateFloorSheetProps = {
  open: boolean;
  onClose: () => void;
  defaultBuildingId?: string | undefined;
};

/**
 * Builder sheet: pick a building, then create a floor.
 */
export const PortalCreateFloorSheet = ({
  open,
  onClose,
  defaultBuildingId,
}: PortalCreateFloorSheetProps) => {
  const t = useTranslations('Admin.floors.create');
  const buildingsQuery = usePortalInventoryBuildingsQuery(1, PORTAL_MAX_PAGE_SIZE);
  const [buildingId, setBuildingId] = useState(defaultBuildingId ?? '');

  useEffect(() => {
    if (!open) {
      return;
    }
    setBuildingId(defaultBuildingId ?? '');
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

  return (
    <AdminCreateSheet open={open} onClose={onClose} title={t('title')} size="comfortable">
      <div className="flex flex-col gap-4">
        <FormField id="portal-create-floor-building" label={t('building')}>
          <ListboxSelect
            id="portal-create-floor-building"
            variant="field"
            searchable
            value={buildingId}
            disabled={buildingsQuery.isLoading}
            options={buildingOptions}
            placeholder={t('searchBuilding')}
            emptyLabel={t('noBuildingMatches')}
            aria-label={t('building')}
            onChange={setBuildingId}
          />
        </FormField>
        {selectedBuilding ? (
          <AddFloorForm
            projectId={selectedBuilding.projectId}
            buildingId={selectedBuilding.id}
            onSuccess={onClose}
          />
        ) : null}
      </div>
    </AdminCreateSheet>
  );
};
