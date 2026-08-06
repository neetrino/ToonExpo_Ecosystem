'use client';

import type { ReadinessAssessmentDetail, ReadinessScoreItem } from '@toonexpo/contracts';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import {
  ReadinessCriterionRow,
  type CriterionDraft,
  type CriterionDraftMap,
} from '@/features/admin/components/readiness-criterion-row';
import {
  buildReadinessDraftMap,
  categoryPercentFromDrafts,
  isReadinessDraftDirty,
  weightedOverallFromPercents,
} from '@/features/admin/components/readiness-management-drafts';
import { useUpsertReadinessCriterionScoresBatchMutation } from '@/features/admin/hooks/use-admin-readiness';
import { barFillColSpanClass } from '@/features/analytics/utils/bar-fill-span';
import { scorePercent } from '@/features/readiness/utils/readiness-score-display';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';

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

type ReadinessManagementBodyProps = {
  assessment: ReadinessAssessmentDetail;
};

/**
 * Editable readiness KPI checklist body for the management sheet.
 */
export const ReadinessManagementBody = ({ assessment }: ReadinessManagementBodyProps) => {
  const t = useTranslations('Admin.readiness.management');
  const [baseline, setBaseline] = useState(() => buildReadinessDraftMap(assessment));
  const [drafts, setDrafts] = useState(() => buildReadinessDraftMap(assessment));
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveMutation = useUpsertReadinessCriterionScoresBatchMutation(assessment.id);

  useEffect(() => {
    const next = buildReadinessDraftMap(assessment);
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
  const dirty = isReadinessDraftDirty(baseline, drafts);
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
      const next = buildReadinessDraftMap(updated);
      setBaseline(next);
      setDrafts(next);
    } catch {
      setSaveError(t('saveError'));
    }
  };

  return (
    <div className="flex flex-col gap-5">
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

      <div className="flex flex-col gap-2 border-t border-border pt-4">
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
