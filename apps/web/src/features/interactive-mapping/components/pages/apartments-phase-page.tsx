'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/i18n/navigation';
import { BackLink } from '@/shared/ui/back-link';

import { useInteractiveMappingProjectQuery } from '../../hooks/use-interactive-mapping';
import { useMappingCatalog } from '../../hooks/use-mapping-catalog';
import { countBuildingsByDistrict } from '../../utils/count-buildings-by-district';
import { MappingBuildingPicker } from '../mapping-building-picker';
import { MappingDistrictPicker } from '../mapping-district-picker';

export type ApartmentsPhasePageProps = {
  projectId: string;
};

/**
 * Phase 4 landing — pick district, then building, then floors for apartments.
 */
export const ApartmentsPhasePage = ({ projectId }: ApartmentsPhasePageProps) => {
  const t = useTranslations('Admin.interactiveMapping');
  const router = useRouter();
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
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
  const { basePath } = catalog;
  const buildingCounts = countBuildingsByDistrict(buildings);
  const selectedDistrict = districts.find((district) => district.id === selectedDistrictId);
  const districtBuildings = selectedDistrictId
    ? buildings.filter((building) => building.districtId === selectedDistrictId)
    : [];

  if (!selectedDistrictId || !selectedDistrict) {
    return (
      <div className="space-y-6">
        <div>
          <BackLink href={`${basePath}/${projectId}`} label={t('backToWizard')} />
          <h1 className="mt-3 font-display text-3xl text-ink">{t('pages.apartmentsDistrict')}</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">{t('hints.pickDistrict')}</p>
        </div>

        <MappingDistrictPicker
          districts={districts}
          buildingCounts={buildingCounts}
          selectedDistrictId={null}
          title={t('forms.pickDistrict')}
          emptyLabel={t('forms.noDistricts')}
          onSelectDistrict={setSelectedDistrictId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <BackLink
          href={`${basePath}/${projectId}/phases/apartments`}
          label={t('backToDistricts')}
          onClick={(event) => {
            event.preventDefault();
            setSelectedDistrictId(null);
          }}
        />
        <h1 className="mt-3 font-display text-3xl text-ink">
          {t('pages.apartmentsChooseBuilding', { district: selectedDistrict.name })}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">{t('hints.apartments')}</p>
      </div>

      <MappingBuildingPicker
        buildings={districtBuildings}
        districts={districts}
        floors={floors}
        apartments={apartments}
        selectedBuildingId={null}
        title={t('forms.pickBuilding')}
        emptyLabel={t('forms.noBuildingsInDistrict')}
        floorsMappedLabel={(values) => t('forms.buildingFloorsMapped', values)}
        apartmentsCountLabel={(values) => t('forms.buildingApartmentsCount', values)}
        onSelectBuilding={(buildingId) => {
          router.push(`${basePath}/${projectId}/phases/apartments/buildings/${buildingId}`);
        }}
      />
    </div>
  );
};
