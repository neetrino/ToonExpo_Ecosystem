'use client';

import type { AdminBuildingListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { ReadinessManagementBody } from '@/features/admin/components/readiness-management-body';
import { useAdminReadinessAssessmentQuery } from '@/features/admin/hooks/use-admin-readiness';
import { useBuildingReadinessAssessment } from '@/features/admin/hooks/use-building-readiness-assessment';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';

export type ReadinessManagementTarget =
  | { kind: 'building'; building: AdminBuildingListItem }
  | { kind: 'assessment'; assessmentId: string; subtitle: string };

type ReadinessManagementModalProps = {
  target: ReadinessManagementTarget | null;
  onClose: () => void;
};

/**
 * Admin Readiness Management side sheet — KPI checklist with explicit Save.
 */
export const ReadinessManagementModal = ({ target, onClose }: ReadinessManagementModalProps) => {
  const t = useTranslations('Admin.readiness.management');
  const open = target != null;

  const buildingTarget = target?.kind === 'building' ? target.building : null;
  const assessmentId = target?.kind === 'assessment' ? target.assessmentId : '';
  const subtitle =
    target?.kind === 'building'
      ? `${target.building.name} · ${target.building.projectName}`
      : target?.kind === 'assessment'
        ? target.subtitle
        : undefined;

  const buildingQuery = useBuildingReadinessAssessment({
    building: buildingTarget,
    enabled: open && target?.kind === 'building',
  });
  const assessmentQuery = useAdminReadinessAssessmentQuery(assessmentId);

  const assessment =
    target?.kind === 'building' ? buildingQuery.assessment : (assessmentQuery.data ?? null);
  const isLoading =
    target?.kind === 'building' ? buildingQuery.isLoading : assessmentQuery.isLoading;
  const isError = target?.kind === 'building' ? buildingQuery.isError : assessmentQuery.isError;

  return (
    <AdminCreateSheet
      open={open}
      onClose={onClose}
      title={t('title')}
      description={subtitle}
      size="default"
    >
      {isLoading ? <p className="text-sm text-ink-secondary">{t('loading')}</p> : null}
      {isError ? (
        <p role="alert" className="text-sm text-danger">
          {t('error')}
        </p>
      ) : null}
      {assessment ? <ReadinessManagementBody assessment={assessment} /> : null}
    </AdminCreateSheet>
  );
};
