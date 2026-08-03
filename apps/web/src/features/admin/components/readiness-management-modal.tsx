'use client';

import type {
  AdminBuildingListItem,
  ReadinessAssessmentDetail,
  ReadinessScoreItem,
} from '@toonexpo/contracts';
import { ChevronDown, ClipboardCheck, X } from 'lucide-react';
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
import { useModalEnterExit } from '@/shared/ui/use-modal-enter-exit';

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
  const [open, setOpen] = useState(false);
  const percent = scorePercent(score.score);

  return (
    <details
      className="group overflow-hidden rounded-[15px] border border-border/80 bg-surface-elevated shadow-xs transition-colors open:border-border-strong open:shadow-sm"
      open={open}
      onToggle={(event) => {
        setOpen(event.currentTarget.open);
      }}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <ChevronDown
            className={cn(
              'size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-premium)]',
              open ? 'rotate-180' : 'rotate-0',
            )}
            aria-hidden
          />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
          {score.categoryName}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <ReadinessStatusBadge status={score.status} namespace="Admin.readiness" />
          <span className="min-w-10 text-right font-display text-sm font-semibold tabular-nums text-ink">
            {percent}%
          </span>
        </span>
      </summary>
      <div className="border-t border-border bg-canvas/60 px-4 py-3">
        <ReadinessCategoryScoreRow assessmentId={assessmentId} score={score} plain />
      </div>
    </details>
  );
};

const OverallScoreHero = ({
  percent,
  status,
}: {
  percent: number;
  status: ReadinessAssessmentDetail['status'];
}) => {
  const t = useTranslations('Admin.readiness.management');

  return (
    <section className="relative overflow-hidden rounded-[15px] border border-border/80 bg-gradient-to-br from-brand-soft via-surface-elevated to-band-mist p-5 shadow-xs">
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold tracking-wide text-brand-secondary uppercase">
              {t('overallScore')}
            </p>
            <p className="font-display text-4xl font-semibold tabular-nums tracking-tight text-ink-navy">
              {percent}
              <span className="ml-0.5 text-2xl text-ink-muted">%</span>
            </p>
          </div>
          <ReadinessStatusBadge status={status} namespace="Admin.readiness" />
        </div>

        <progress
          className={cn(
            'h-2 w-full overflow-hidden rounded-pill bg-surface-elevated/80 ring-1 ring-border/60',
            '[&::-webkit-progress-bar]:rounded-pill [&::-webkit-progress-bar]:bg-surface-elevated',
            '[&::-webkit-progress-value]:rounded-pill [&::-moz-progress-bar]:rounded-pill',
            percent >= 70
              ? '[&::-webkit-progress-value]:bg-success [&::-moz-progress-bar]:bg-success'
              : percent >= 40
                ? '[&::-webkit-progress-value]:bg-brand [&::-moz-progress-bar]:bg-brand'
                : '[&::-webkit-progress-value]:bg-danger [&::-moz-progress-bar]:bg-danger',
          )}
          value={percent}
          max={100}
          aria-label={t('overallScore')}
        />

        <p className="text-xs leading-relaxed text-ink-secondary">{t('projectHint')}</p>
      </div>
    </section>
  );
};

const AssessmentBody = ({ assessment }: { assessment: ReadinessAssessmentDetail }) => {
  const t = useTranslations('Admin.readiness.management');
  const overallPercent = scorePercent(assessment.overallScore);

  return (
    <div className="flex flex-col gap-6">
      <OverallScoreHero percent={overallPercent} status={assessment.status} />

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-ink">{t('categoriesTitle')}</h3>
          <span className="text-xs text-ink-muted">{assessment.scores.length}</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {assessment.scores.map((score) => (
            <CategoryAccordion key={score.id} assessmentId={assessment.id} score={score} />
          ))}
        </div>
      </section>
    </div>
  );
};

/**
 * Centered Readiness Management popup — ToonExpo admin visual language.
 */
export const ReadinessManagementModal = ({ target, onClose }: ReadinessManagementModalProps) => {
  const t = useTranslations('Admin.readiness.management');
  const tCommon = useTranslations('Common');
  const titleId = useId();
  const open = target != null;
  const { isVisible, isExiting, backdropMotionClass, panelMotionClass, handlePanelAnimationEnd } =
    useModalEnterExit({ isOpen: open });

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
    if (!isVisible || isExiting) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
        blurActiveElementAfterEscClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isVisible, isExiting, onClose]);

  if (!isVisible || typeof document === 'undefined') {
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
        className={cn(
          'absolute inset-0 cursor-default rounded-none',
          MODAL_BACKDROP_CLASS_NAME,
          backdropMotionClass,
        )}
        disabled={isExiting}
        onClick={() => {
          if (!isExiting) {
            onClose();
          }
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative z-10 flex max-h-[min(88dvh,42rem)] w-full max-w-2xl flex-col overflow-hidden',
          'rounded-[20px] border border-border/80 bg-surface-elevated shadow-lg ring-1 ring-border/50',
          panelMotionClass,
        )}
        onClick={(event) => {
          event.stopPropagation();
        }}
        onAnimationEnd={handlePanelAnimationEnd}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border/80 bg-canvas/80 px-5 py-4 backdrop-blur-sm">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand shadow-xs">
              <ClipboardCheck className="size-5" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0 pt-0.5">
              <h2
                id={titleId}
                className="font-display text-lg font-semibold tracking-tight text-ink"
              >
                {t('title')}
              </h2>
              {subtitle ? (
                <p className="mt-0.5 truncate text-sm text-ink-secondary">{subtitle}</p>
              ) : null}
            </div>
          </div>
          <IconButton label={tCommon('close')} onClick={onClose} size="sm" disabled={isExiting}>
            <X className="size-4" aria-hidden />
          </IconButton>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background px-5 py-5">
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
