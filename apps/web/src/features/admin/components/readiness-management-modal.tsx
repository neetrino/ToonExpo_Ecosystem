'use client';

import type {
  AdminBuildingListItem,
  ReadinessAssessmentDetail,
  ReadinessScoreItem,
} from '@toonexpo/contracts';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';

import { ReadinessCategoryScoreRow } from '@/features/admin/components/readiness-category-score-row';
import { useAdminReadinessAssessmentQuery } from '@/features/admin/hooks/use-admin-readiness';
import { useBuildingReadinessAssessment } from '@/features/admin/hooks/use-building-readiness-assessment';
import { ReadinessStatusBadge } from '@/features/readiness/components/readiness-status-badge';
import { READINESS_SCORE_MAX } from '@/features/readiness/constants';
import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
import { cn } from '@/shared/ui/cn';
import { IconButton } from '@/shared/ui/icon-button';
import { MODAL_BACKDROP_CLASS_NAME } from '@/shared/ui/modal-backdrop';
import { getOverlayPortalHost } from '@/shared/ui/overlay-portal-host';

export type ReadinessManagementTarget =
  | { kind: 'building'; building: AdminBuildingListItem }
  | { kind: 'assessment'; assessmentId: string; subtitle: string };

type ReadinessManagementModalProps = {
  target: ReadinessManagementTarget | null;
  onClose: () => void;
};

const scorePercent = (score: number | null): number => {
  if (score === null) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((score / READINESS_SCORE_MAX) * 100)));
};

const CategoryAccordion = ({
  assessmentId,
  score,
}: {
  assessmentId: string;
  score: ReadinessScoreItem;
}) => {
  const percent = scorePercent(score.score);

  return (
    <details className="rounded-md border border-border bg-background open:bg-surface/30">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
          {score.categoryName}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <ReadinessStatusBadge status={score.status} namespace="Admin.readiness" />
          <span className="tabular-nums text-sm font-medium text-ink">{percent}%</span>
        </span>
      </summary>
      <div className="border-t border-border p-3">
        <ReadinessCategoryScoreRow assessmentId={assessmentId} score={score} plain />
      </div>
    </details>
  );
};

const AssessmentBody = ({ assessment }: { assessment: ReadinessAssessmentDetail }) => {
  const t = useTranslations('Admin.readiness.management');
  const overallPercent = scorePercent(assessment.overallScore);

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-md border border-border bg-surface/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-ink">{t('overallScore')}</span>
          <span className="text-xl font-semibold tabular-nums text-ink">{overallPercent}%</span>
        </div>
        <progress
          className={cn(
            'mt-3 h-2.5 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-background [&::-webkit-progress-value]:rounded-full [&::-moz-progress-bar]:rounded-full',
            overallPercent >= 70
              ? '[&::-webkit-progress-value]:bg-success [&::-moz-progress-bar]:bg-success'
              : overallPercent >= 40
                ? '[&::-webkit-progress-value]:bg-brand [&::-moz-progress-bar]:bg-brand'
                : '[&::-webkit-progress-value]:bg-danger [&::-moz-progress-bar]:bg-danger',
          )}
          value={overallPercent}
          max={100}
          aria-label={t('overallScore')}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
          <ReadinessStatusBadge status={assessment.status} namespace="Admin.readiness" />
          <span>{t('projectHint')}</span>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-ink">{t('categoriesTitle')}</h3>
        <div className="flex flex-col gap-2">
          {assessment.scores.map((score) => (
            <CategoryAccordion key={score.id} assessmentId={assessment.id} score={score} />
          ))}
        </div>
      </section>
    </div>
  );
};

/**
 * Centered Readiness Management popup (building or existing assessment).
 * Portals into the desktop fluid stage so zoom/layout never clips the panel.
 */
export const ReadinessManagementModal = ({ target, onClose }: ReadinessManagementModalProps) => {
  const t = useTranslations('Admin.readiness.management');
  const tCommon = useTranslations('Common');
  const titleId = useId();
  const open = target != null;
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
        blurActiveElementAfterEscClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-x-0 top-0 z-[var(--z-modal)] flex h-fluid-screen items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={tCommon('close')}
        className={cn('absolute inset-0 cursor-default rounded-none', MODAL_BACKDROP_CLASS_NAME)}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(88dvh,44rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-xl"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {t('title')}
            </h2>
            {subtitle ? (
              <p className="mt-1 truncate text-sm text-ink-secondary">{subtitle}</p>
            ) : null}
          </div>
          <IconButton label={tCommon('close')} onClick={onClose} size="sm">
            <X className="size-4" aria-hidden />
          </IconButton>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {isLoading ? <p className="text-sm text-ink-secondary">{t('loading')}</p> : null}
          {isError ? (
            <p role="alert" className="text-sm text-danger">
              {t('error')}
            </p>
          ) : null}
          {assessment ? <AssessmentBody assessment={assessment} /> : null}
        </div>
      </div>
    </div>,
    getOverlayPortalHost(),
  );
};
