'use client';

import type { InteractiveMappingPhaseProgress } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { BackLink } from '@/shared/ui/back-link';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { Reveal } from '@/shared/ui/motion';

import { useInteractiveMappingProjectQuery } from '../hooks/use-interactive-mapping';
import { useInteractiveMappingScope } from '../scope/interactive-mapping-scope';
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
 * Entity creation happens inside each phase editor after entering the map.
 */
export const PhaseWizardPage = ({ projectId }: PhaseWizardPageProps) => {
  const t = useTranslations('Admin.interactiveMapping');
  const { basePath } = useInteractiveMappingScope();
  const detailQuery = useInteractiveMappingProjectQuery(projectId);

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
  const base = `${basePath}/${project.id}`;

  const primaryDistrict = districts[0];
  const primaryBuilding =
    buildings.find((item) => item.districtId === primaryDistrict?.id) ?? buildings[0];
  const primaryFloor =
    floors.find(
      (item) =>
        item.buildingId === primaryBuilding?.id && (item.hasBuildingPolygon || item.hasFloorPlan),
    ) ??
    floors.find((item) => item.hasBuildingPolygon || item.hasFloorPlan) ??
    floors.find((item) => item.buildingId === primaryBuilding?.id) ??
    floors[0];

  return (
    <div className="space-y-8">
      <Reveal force>
        <div>
          <BackLink href={basePath} label={t('backToProjects')} />
          <h1 className="mt-3 font-display text-4xl text-ink">{project.name}</h1>
          <p className="mt-2 text-sm text-ink-muted">
            {project.activePhase
              ? t('activePhase', { phase: project.activePhase })
              : t('allPhasesDone')}
          </p>
        </div>
      </Reveal>

      <AdminListCardGrid className="gap-3 md:grid-cols-2 xl:grid-cols-2">
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
          addHref={`${base}/phases/masterplan`}
          addLabel={t('cta.mapDistricts')}
          doneLabel={t('cta.edit')}
          lockedLabel={t('cta.locked')}
        />

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
        />

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
            primaryBuilding ? `${base}/buildings/${primaryBuilding.id}/render` : undefined
          }
          addLabel={t('cta.mapFloors')}
          doneLabel={t('cta.edit')}
          lockedLabel={t('cta.locked')}
        />

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
        />
      </AdminListCardGrid>
    </div>
  );
};
