'use client';

import type { InteractiveMappingPhaseProgress } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';

import { createPortalApartment } from '@/features/builder/api/portal-apartments-api';
import { createPortalBuilding } from '@/features/builder/api/portal-buildings-api';
import { Link } from '@/i18n/navigation';

import { adminCatalogScope } from '../api/interactive-mapping-api';
import { INTERACTIVE_MAPPING_BASE_PATH, interactiveMappingProjectQueryKey } from '../constants';
import {
  useCreateDistrictMutation,
  useInteractiveMappingProjectQuery,
  useSetupBuildingFloorsMutation,
} from '../hooks/use-interactive-mapping';
import { BuildingFloorSetupForm } from './building-floor-setup-form';
import { CreateEntityInlineForm } from './forms/create-entity-inline-form';
import { PhaseCard } from './phase-card';

export type PhaseWizardPageProps = {
  projectId: string;
};

const phaseState = (
  phases: InteractiveMappingPhaseProgress[],
  phase: 1 | 2 | 3 | 4,
): InteractiveMappingPhaseProgress['status'] =>
  phases.find((item) => item.phase === phase)?.status ?? 'locked';

const statusKey = (status: InteractiveMappingPhaseProgress['status']): string => {
  if (status === 'done') {
    return 'status.done';
  }
  if (status === 'active') {
    return 'status.active';
  }
  return 'status.locked';
};

/**
 * 4-phase interactive mapping wizard for one project.
 */
export const PhaseWizardPage = ({ projectId }: PhaseWizardPageProps) => {
  const t = useTranslations('Admin.interactiveMapping');
  const queryClient = useQueryClient();
  const detailQuery = useInteractiveMappingProjectQuery(projectId);
  const createDistrict = useCreateDistrictMutation(projectId);
  const setupFloors = useSetupBuildingFloorsMutation(projectId);

  if (detailQuery.isLoading) {
    return <p className="text-sm text-ink-muted">{t('loading')}</p>;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const detail = detailQuery.data;
  const { project, districts, buildings, floors, apartments } = detail;
  const companyId = project.builderCompanyId;
  const scope = adminCatalogScope(companyId);
  const base = `${INTERACTIVE_MAPPING_BASE_PATH}/${project.id}`;

  const primaryDistrict = districts[0];
  const primaryBuilding =
    buildings.find((item) => item.districtId === primaryDistrict?.id) ?? buildings[0];
  const primaryFloor = floors.find((item) => item.buildingId === primaryBuilding?.id) ?? floors[0];

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: interactiveMappingProjectQueryKey(projectId),
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          href={INTERACTIVE_MAPPING_BASE_PATH}
          className="text-xs uppercase tracking-[0.14em] text-ink-muted underline-offset-4 hover:underline"
        >
          {t('backToProjects')}
        </Link>
        <h1 className="mt-3 font-display text-4xl text-ink">{project.name}</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {project.activePhase
            ? t('activePhase', { phase: project.activePhase })
            : t('allPhasesDone')}
        </p>
      </div>

      <div className="space-y-3">
        <PhaseCard
          step={1}
          title={t('phases.districts')}
          hint={t('hints.districts')}
          state={phaseState(project.phases, 1)}
          progressLabel={t('progress.districts', {
            done: districts.length,
            total: Math.max(districts.length, 1),
          })}
          statusLabel={t(statusKey(phaseState(project.phases, 1)))}
          addHref={districts.length > 0 ? `${base}/phases/masterplan` : undefined}
          addLabel={t('cta.mapDistricts')}
          doneLabel={t('cta.edit')}
          lockedLabel={t('cta.locked')}
        >
          <CreateEntityInlineForm
            title={t('forms.createDistrict')}
            submitLabel={t('forms.createDistrict')}
            pendingLabel={t('forms.saving')}
            nameLabel={t('forms.name')}
            namePlaceholder={t('forms.districtPlaceholder')}
            onSubmit={async (name) => {
              await createDistrict.mutateAsync({ name });
            }}
          />
        </PhaseCard>

        <PhaseCard
          step={2}
          title={t('phases.buildings')}
          hint={t('hints.buildings')}
          state={phaseState(project.phases, 2)}
          progressLabel={t('progress.buildings', {
            done: buildings.length,
            total: Math.max(buildings.length, 1),
          })}
          statusLabel={t(statusKey(phaseState(project.phases, 2)))}
          addHref={primaryDistrict ? `${base}/districts/${primaryDistrict.id}` : undefined}
          addLabel={t('cta.mapBuildings')}
          doneLabel={t('cta.edit')}
          lockedLabel={t('cta.locked')}
          extras={districts.slice(1, 7).map((district) => ({
            href: `${base}/districts/${district.id}`,
            label: district.name,
          }))}
          extrasTitle={t('cta.other')}
        >
          {primaryDistrict ? (
            <CreateEntityInlineForm
              title={t('forms.createBuilding')}
              submitLabel={t('forms.createBuilding')}
              pendingLabel={t('forms.saving')}
              nameLabel={t('forms.name')}
              namePlaceholder={t('forms.buildingPlaceholder')}
              onSubmit={async (name) => {
                await createPortalBuilding(project.id, { name }, { scope });
                invalidate();
              }}
            />
          ) : null}
        </PhaseCard>

        <PhaseCard
          step={3}
          title={t('phases.floors')}
          hint={t('hints.floors')}
          state={phaseState(project.phases, 3)}
          progressLabel={t('progress.floors', {
            done: floors.length,
            total: Math.max(floors.length, 1),
          })}
          statusLabel={t(statusKey(phaseState(project.phases, 3)))}
          addHref={
            primaryBuilding && floors.length > 0
              ? `${base}/buildings/${primaryBuilding.id}/render`
              : undefined
          }
          addLabel={t('cta.mapFloors')}
          doneLabel={t('cta.edit')}
          lockedLabel={t('cta.locked')}
        >
          {primaryBuilding ? (
            <BuildingFloorSetupForm
              buildingName={primaryBuilding.name}
              initialFloorCount={primaryBuilding.floorsCount ?? 1}
              submitLabel={t('forms.setupFloors')}
              pendingLabel={t('forms.saving')}
              floorCountLabel={t('forms.floorCount')}
              hint={t('hints.setupFloors')}
              onSubmit={async (floorCount) => {
                await setupFloors.mutateAsync({
                  buildingId: primaryBuilding.id,
                  body: { floorCount },
                });
              }}
            />
          ) : null}
        </PhaseCard>

        <PhaseCard
          step={4}
          title={t('phases.apartments')}
          hint={t('hints.apartments')}
          state={phaseState(project.phases, 4)}
          progressLabel={t('progress.apartments', {
            done: apartments.length,
            total: Math.max(apartments.length, 1),
          })}
          statusLabel={t(statusKey(phaseState(project.phases, 4)))}
          addHref={primaryFloor ? `${base}/floors/${primaryFloor.id}` : undefined}
          addLabel={t('cta.mapApartments')}
          doneLabel={t('cta.edit')}
          lockedLabel={t('cta.locked')}
        >
          {primaryFloor ? (
            <CreateEntityInlineForm
              title={t('forms.createApartment')}
              submitLabel={t('forms.createApartment')}
              pendingLabel={t('forms.saving')}
              nameLabel={t('forms.apartmentNumber')}
              namePlaceholder={t('forms.apartmentPlaceholder')}
              onSubmit={async (number) => {
                await createPortalApartment(primaryFloor.id, { number }, { scope });
                invalidate();
              }}
            />
          ) : null}
        </PhaseCard>
      </div>
    </div>
  );
};
