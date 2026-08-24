'use client';

import { useTranslations } from 'next-intl';

import { useRouter } from '@/i18n/navigation';
import { BackLink } from '@/shared/ui/back-link';

import { useInteractiveMappingProjectQuery } from '../../hooks/use-interactive-mapping';
import { useMappingCatalog } from '../../hooks/use-mapping-catalog';
import { MappingBuildingPicker } from '../mapping-building-picker';

export type FloorsPhasePageProps = {
  projectId: string;
};

/**
 * Phase 3 landing — pick which building to map floors on.
 */
export const FloorsPhasePage = ({ projectId }: FloorsPhasePageProps) => {
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

  const { districts, buildings, floors, apartments, canvases } = detailQuery.data;
  const { basePath } = catalog;

  return (
    <div className="space-y-6">
      <div>
        <BackLink href={`${basePath}/${projectId}`} label={t('backToWizard')} />
        <h1 className="mt-3 font-display text-3xl text-ink">{t('pages.floors')}</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">{t('hints.floors')}</p>
      </div>

      <MappingBuildingPicker
        variant="cards"
        buildings={buildings}
        districts={districts}
        floors={floors}
        canvases={canvases}
        apartments={apartments}
        selectedBuildingId={null}
        title={t('forms.pickBuilding')}
        emptyLabel={t('forms.noBuildings')}
        floorsMappedLabel={(values) => t('forms.buildingFloorsMapped', values)}
        onSelectBuilding={(buildingId) => {
          router.push(`${basePath}/${projectId}/buildings/${buildingId}/render`);
        }}
      />
    </div>
  );
};
