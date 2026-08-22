'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useRouter } from '@/i18n/navigation';
import { BackLink } from '@/shared/ui/back-link';

import { useInteractiveMappingProjectQuery } from '../../hooks/use-interactive-mapping';
import { useMappingCatalog } from '../../hooks/use-mapping-catalog';
import { FloorPlanUploadPicker } from '../floor-plan-upload-picker';
import { MappingBuildingPicker } from '../mapping-building-picker';

export type ApartmentsBuildingPhasePageProps = {
  projectId: string;
  buildingId: string;
};

/**
 * Phase 4 — pick a floor within the selected building.
 */
export const ApartmentsBuildingPhasePage = ({
  projectId,
  buildingId,
}: ApartmentsBuildingPhasePageProps) => {
  const t = useTranslations('Admin.interactiveMapping');
  const router = useRouter();
  const [lockNotice, setLockNotice] = useState<string | null>(null);
  const detailQuery = useInteractiveMappingProjectQuery(projectId);
  const companyId = detailQuery.data?.project.builderCompanyId;
  const catalog = useMappingCatalog(companyId);

  if (detailQuery.isLoading) {
    return <p className="text-sm text-ink-muted">{t('loading')}</p>;
  }

  if (detailQuery.isError || !detailQuery.data || !catalog) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const { districts, buildings, floors, apartments } = detailQuery.data;
  const building = buildings.find((item) => item.id === buildingId);
  const { basePath } = catalog;

  if (!building) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const buildingFloors = floors.filter((floor) => floor.buildingId === buildingId);

  return (
    <div className="space-y-6">
      <div>
        <BackLink href={`${basePath}/${projectId}/phases/apartments`} label={t('backToWizard')} />
        <h1 className="mt-3 font-display text-3xl text-ink">
          {t('pages.apartmentsBuilding', { name: building.name })}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">{t('hints.pickApartmentFloor')}</p>
      </div>

      <MappingBuildingPicker
        buildings={buildings}
        districts={districts}
        floors={floors}
        apartments={apartments}
        selectedBuildingId={buildingId}
        title={t('forms.pickBuilding')}
        emptyLabel={t('forms.noBuildings')}
        floorsMappedLabel={(values) => t('forms.buildingFloorsMapped', values)}
        apartmentsCountLabel={(values) => t('forms.buildingApartmentsCount', values)}
        onSelectBuilding={(nextBuildingId) => {
          if (nextBuildingId === buildingId) {
            return;
          }
          setLockNotice(null);
          router.push(`${basePath}/${projectId}/phases/apartments/buildings/${nextBuildingId}`);
        }}
      />

      <FloorPlanUploadPicker
        floors={buildingFloors}
        selectedFloorId={null}
        title={t('forms.pickFloor')}
        emptyLabel={t('forms.noFloors')}
        lockedHint={t('forms.floorNeedsPolygon')}
        planReadyLabel={t('forms.planReady')}
        needsPolygonLabel={t('forms.needsPolygon')}
        onSelectFloor={(floorId) => {
          setLockNotice(null);
          router.push(`${basePath}/${projectId}/floors/${floorId}`);
        }}
        onSelectLockedFloor={(lockedFloor) => {
          setLockNotice(
            t('forms.floorNeedsPolygonNamed', {
              name: lockedFloor.name ?? String(lockedFloor.number),
            }),
          );
        }}
      />

      {lockNotice ? (
        <p role="status" className="text-sm text-ink-muted">
          {lockNotice}
        </p>
      ) : null}
    </div>
  );
};
