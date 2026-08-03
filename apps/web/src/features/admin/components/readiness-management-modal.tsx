'use client';

import type {
  AdminBuildingListItem,
  ReadinessAssessmentDetail,
  ReadinessCriterionScoreItem,
  ReadinessScoreItem,
} from '@toonexpo/contracts';
import { ChevronDown, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  ReadinessCriterionRow,
  type CriterionDraft,
  type CriterionDraftMap,
} from '@/features/admin/components/readiness-criterion-row';
import {
  useAdminReadinessAssessmentQuery,
  useUpsertReadinessCriterionScoresBatchMutation,
} from '@/features/admin/hooks/use-admin-readiness';
import { useBuildingReadinessAssessment } from '@/features/admin/hooks/use-building-readiness-assessment';
import { barFillColSpanClass } from '@/features/analytics/utils/bar-fill-span';
import { READINESS_SCORE_MAX } from '@/features/readiness/constants';
import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
import { Button } from '@/shared/ui/button';
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

const flattenCriteria = (
  items: readonly ReadinessCriterionScoreItem[],
): ReadinessCriterionScoreItem[] => {
  const result: ReadinessCriterionScoreItem[] = [];
  const walk = (nodes: readonly ReadinessCriterionScoreItem[]) => {
    for (const node of nodes) {
      result.push(node);
      walk(node.children);
    }
  };
  walk(items);
  return result;
};

const buildDraftMap = (assessment: ReadinessAssessmentDetail): CriterionDraftMap => {
  const drafts: CriterionDraftMap = {};
  for (const score of assessment.scores) {
    for (const criterion of flattenCriteria(score.criteria)) {
      drafts[criterion.criterionId] = {
        value: criterion.value,
        checked: criterion.checked,
      };
    }
  }
  return drafts;
};

const categoryPercentFromDrafts = (
  roots: readonly ReadinessCriterionScoreItem[],
  drafts: CriterionDraftMap,
): number | null => {
  let earned = 0;
  let max = 0;
  for (const criterion of flattenCriteria(roots)) {
    if (criterion.children.length > 0) {
      continue;
    }
    if (criterion.maxPoints === null || criterion.maxPoints <= 0) {
      continue;
    }
    const draft = drafts[criterion.criterionId];
    const value = draft ? draft.value : criterion.value;
    if (value === null) {
      continue;
    }
    earned += Math.min(criterion.maxPoints, Math.max(0, value));
    max += criterion.maxPoints;
  }
  if (max === 0) {
    return null;
  }
  return Math.round((earned / max) * 100);
};

const weightedOverallFromPercents = (
  entries: readonly { percent: number | null; weight: number | null }[],
): number => {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const entry of entries) {
    if (entry.percent === null) {
      continue;
    }
    const weight = entry.weight ?? 1;
    weightedSum += entry.percent * weight;
    totalWeight += weight;
  }
  if (totalWeight === 0) {
    return 0;
  }
  return Math.round(weightedSum / totalWeight);
};

const isDirty = (baseline: CriterionDraftMap, drafts: CriterionDraftMap): boolean => {
  const ids = new Set([...Object.keys(baseline), ...Object.keys(drafts)]);
  for (const id of ids) {
    const left = baseline[id];
    const right = drafts[id];
    if (!left || !right) {
      return true;
    }
    if (left.value !== right.value || left.checked !== right.checked) {
      return true;
    }
  }
  return false;
};

const ProgressBar = ({ percent, heightClass }: { percent: number; heightClass: string }) => {
  const spanClass = barFillColSpanClass(percent, 100);
  return (
    <div className={cn('grid grid-cols-10 overflow-hidden rounded-pill bg-surface', heightClass)}>
      {spanClass ? (
        <div
          className={cn(
            'h-full rounded-pill',
            percent >= 70 ? 'bg-success' : percent >= 40 ? 'bg-brand' : 'bg-danger',
            spanClass,
          )}
        />
      ) : null}
    </div>
  );
};

const CategorySummaryChip = ({
  score,
  percent,
}: {
  score: ReadinessScoreItem;
  percent: number;
}) => {
  const tKpi = useTranslations('ReadinessKpi');
  const weight = score.categoryWeight;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <p className="truncate text-xs text-ink-secondary">
        {tKpi(`categories.${score.categoryCode}`)}
        {weight !== null ? ` (${weight}%)` : null}
      </p>
      <p className="text-sm font-semibold tabular-nums text-ink">{percent}%</p>
      <ProgressBar percent={percent} heightClass="h-1" />
    </div>
  );
};

const CategoryAccordion = ({
  score,
  percent,
  drafts,
  disabled,
  defaultOpen,
  onChange,
}: {
  score: ReadinessScoreItem;
  percent: number;
  drafts: CriterionDraftMap;
  disabled: boolean;
  defaultOpen: boolean;
  onChange: (criterionId: string, next: CriterionDraft) => void;
}) => {
  const tKpi = useTranslations('ReadinessKpi');
  const [open, setOpen] = useState(defaultOpen);
  const weight = score.categoryWeight;
  const title = tKpi(`categories.${score.categoryCode}`);

  return (
    <details
      className="group overflow-hidden rounded-md border border-border bg-surface-elevated"
      open={open}
      onToggle={(event) => {
        setOpen(event.currentTarget.open);
      }}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
          {title}
          {weight !== null ? ` (${weight}%)` : null}
        </span>
        <span
          className={cn(
            'shrink-0 text-sm font-semibold tabular-nums',
            percent >= 70 ? 'text-success' : 'text-ink',
          )}
        >
          {percent}%
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-ink-muted transition-transform duration-[var(--duration-base)]',
            open ? 'rotate-180' : 'rotate-0',
          )}
          aria-hidden
        />
      </summary>
      <div className="border-t border-border px-4 py-2">
        {score.criteria.map((criterion) => (
          <ReadinessCriterionRow
            key={criterion.criterionId}
            item={criterion}
            drafts={drafts}
            disabled={disabled}
            onChange={onChange}
          />
        ))}
      </div>
    </details>
  );
};

const AssessmentBody = ({ assessment }: { assessment: ReadinessAssessmentDetail }) => {
  const t = useTranslations('Admin.readiness.management');
  const [baseline, setBaseline] = useState(() => buildDraftMap(assessment));
  const [drafts, setDrafts] = useState(() => buildDraftMap(assessment));
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveMutation = useUpsertReadinessCriterionScoresBatchMutation(assessment.id);

  useEffect(() => {
    const next = buildDraftMap(assessment);
    setBaseline(next);
    setDrafts(next);
    setSaveError(null);
  }, [assessment.id, assessment.updatedAt]);

  const categoryPercents = useMemo(
    () =>
      assessment.scores.map((score) => ({
        scoreId: score.id,
        percent: categoryPercentFromDrafts(score.criteria, drafts) ?? 0,
        weight: score.categoryWeight,
      })),
    [assessment.scores, drafts],
  );

  const overallPercent = weightedOverallFromPercents(categoryPercents);
  const dirty = isDirty(baseline, drafts);
  const busy = saveMutation.isPending;

  const onDraftChange = (criterionId: string, next: CriterionDraft) => {
    setDrafts((prev) => ({ ...prev, [criterionId]: next }));
  };

  const onSave = async () => {
    setSaveError(null);
    const items = Object.entries(drafts)
      .filter(([criterionId, draft]) => {
        const original = baseline[criterionId];
        if (!original) {
          return true;
        }
        return original.value !== draft.value || original.checked !== draft.checked;
      })
      .map(([criterionId, draft]) => ({
        criterionId,
        value: draft.value,
        checked: draft.checked,
      }));

    if (items.length === 0) {
      return;
    }

    try {
      const updated = await saveMutation.mutateAsync({ items });
      const next = buildDraftMap(updated);
      setBaseline(next);
      setDrafts(next);
    } catch {
      setSaveError(t('saveError'));
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain">
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">{t('overallScore')}</p>
            <p
              className={cn(
                'text-lg font-semibold tabular-nums',
                overallPercent >= 70 ? 'text-success' : 'text-ink',
              )}
            >
              {overallPercent}%
            </p>
          </div>
          <ProgressBar percent={overallPercent} heightClass="h-3" />
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {assessment.scores.map((score) => {
            const percent =
              categoryPercents.find((entry) => entry.scoreId === score.id)?.percent ??
              scorePercent(score.score);
            return <CategorySummaryChip key={score.id} score={score} percent={percent} />;
          })}
        </div>

        <div className="flex flex-col gap-2">
          {assessment.scores.map((score, index) => {
            const percent =
              categoryPercents.find((entry) => entry.scoreId === score.id)?.percent ??
              scorePercent(score.score);
            return (
              <CategoryAccordion
                key={score.id}
                score={score}
                percent={percent}
                drafts={drafts}
                disabled={busy}
                defaultOpen={index === 0}
                onChange={onDraftChange}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex shrink-0 flex-col gap-2 border-t border-border pt-4">
        <p className="text-xs text-ink-secondary">{t('projectHint')}</p>
        {saveError ? (
          <p role="alert" className="text-sm text-danger">
            {saveError}
          </p>
        ) : null}
        <div className="flex justify-end">
          <Button type="button" onClick={() => void onSave()} disabled={!dirty || busy}>
            {busy ? t('saving') : t('save')}
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Admin Readiness Management modal — KPI checklist with explicit Save.
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
          'relative z-10 flex max-h-[min(92dvh,48rem)] w-full max-w-3xl flex-col overflow-hidden',
          'rounded-md border border-border bg-surface-elevated shadow-lg',
          panelMotionClass,
        )}
        onClick={(event) => {
          event.stopPropagation();
        }}
        onAnimationEnd={handlePanelAnimationEnd}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {t('title')}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 truncate text-sm text-ink-secondary">{subtitle}</p>
            ) : null}
          </div>
          <IconButton label={tCommon('close')} onClick={onClose} size="sm" disabled={isExiting}>
            <X className="size-4" aria-hidden />
          </IconButton>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-5">
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
