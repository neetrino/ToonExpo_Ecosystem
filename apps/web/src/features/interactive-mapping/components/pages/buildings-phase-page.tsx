'use client';

import { useTranslations } from 'next-intl';

import { useRouter } from '@/i18n/navigation';
import { BackLink } from '@/shared/ui/back-link';

import { useInteractiveMappingProjectQuery } from '../../hooks/use-interactive-mapping';
import { useMappingCatalog } from '../../hooks/use-mapping-catalog';
import { countBuildingsByDistrict } from '../../utils/count-buildings-by-district';
import { MappingDistrictPicker } from '../mapping-district-picker';

export type BuildingsPhasePageProps = {
  projectId: string;
};

/**
 * Phase 2 landing — pick a district before mapping buildings on its plan.
 */
export const BuildingsPhasePage = ({ projectId }: BuildingsPhasePageProps) => {
  const t = useTranslations('Admin.interactiveMapping');
  const router = useRouter();
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

  const { districts, buildings } = detailQuery.data;
  const { basePath } = catalog;

  return (
    <div className="space-y-6">
      <div>
        <BackLink href={`${basePath}/${projectId}`} label={t('backToWizard')} />
        <h1 className="mt-3 font-display text-3xl text-ink">{t('pages.buildingsDistrict')}</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">{t('hints.pickDistrict')}</p>
      </div>

      <MappingDistrictPicker
        districts={districts}
        buildingCounts={countBuildingsByDistrict(buildings)}
        selectedDistrictId={null}
        title={t('forms.pickDistrict')}
        emptyLabel={t('forms.noDistricts')}
        onSelectDistrict={(districtId) => {
          router.push(`${basePath}/${projectId}/districts/${districtId}`);
        }}
      />
    </div>
  );
};
