'use client';

import type { PortalReadinessScoreItem, ReadinessScoreStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ReadinessHelpDialog } from '@/features/builder/components/readiness-help-dialog';
import { ReadinessProgressRing } from '@/features/readiness/components/readiness-progress-ring';
import { READINESS_SCORE_MAX } from '@/features/readiness/constants';
import { barFillColSpanClass } from '@/features/analytics/utils/bar-fill-span';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';

const HELP_STATUSES = new Set<ReadinessScoreStatus>(['needs_improvement', 'in_progress']);

export const scorePercent = (score: number | null): number => {
  if (score === null) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((score / READINESS_SCORE_MAX) * 100)));
};

export const toneForStatus = (
  status: ReadinessScoreStatus,
): 'brand' | 'success' | 'warning' | 'danger' | 'muted' => {
  if (status === 'ready') {
    return 'success';
  }
  if (status === 'needs_improvement') {
    return 'danger';
  }
  if (status === 'blocked') {
    return 'warning';
  }
  if (status === 'not_started') {
    return 'muted';
  }
  return 'brand';
};

const barToneClass = (status: ReadinessScoreStatus): string => {
  if (status === 'ready') {
    return 'bg-success';
  }
  if (status === 'needs_improvement') {
    return 'bg-danger';
  }
  if (status === 'blocked') {
    return 'bg-warning';
  }
  if (status === 'not_started') {
    return 'bg-ink-muted/40';
  }
  return 'bg-brand';
};

type BuilderReadinessCategoryProgressRowProps = {
  score: PortalReadinessScoreItem;
};

/**
 * Flat progress row for a readiness category.
 */
export const BuilderReadinessCategoryProgressRow = ({
  score,
}: BuilderReadinessCategoryProgressRowProps) => {
  const t = useTranslations('Builder.readiness');
  const [helpOpen, setHelpOpen] = useState(false);
  const percent = scorePercent(score.score);
  const spanClass = barFillColSpanClass(percent, 100);

  const showHelp =
    score.helpAvailable &&
    HELP_STATUSES.has(score.status) &&
    score.serviceProviderCategoryId != null;

  return (
    <>
      <div className="flex flex-col gap-2 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{score.categoryName}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{t(`statuses.${score.status}`)}</p>
          </div>
          <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">{percent}%</span>
        </div>

        <div
          className="grid h-2 grid-cols-10 overflow-hidden rounded-pill bg-surface"
          role="presentation"
        >
          {spanClass ? (
            <div className={cn('h-full rounded-pill', barToneClass(score.status), spanClass)} />
          ) : null}
        </div>

        {score.recommendationSummary ? (
          <p className="text-xs leading-relaxed text-ink-secondary">
            {score.recommendationSummary}
          </p>
        ) : null}

        {showHelp ? (
          <div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setHelpOpen(true);
              }}
            >
              {t('helpButton')}
            </Button>
          </div>
        ) : null}
      </div>

      {helpOpen && score.serviceProviderCategoryId ? (
        <ReadinessHelpDialog
          categoryName={score.categoryName}
          categoryId={score.serviceProviderCategoryId}
          onClose={() => {
            setHelpOpen(false);
          }}
        />
      ) : null}
    </>
  );
};

type BuilderReadinessCategoryGaugeProps = {
  score: PortalReadinessScoreItem;
};

/**
 * Compact category gauge used in the overview strip.
 */
export const BuilderReadinessCategoryGauge = ({ score }: BuilderReadinessCategoryGaugeProps) => {
  const percent = scorePercent(score.score);

  return (
    <div className="flex w-[4.75rem] flex-col items-center gap-1.5">
      <ReadinessProgressRing
        percent={percent}
        size="sm"
        tone={toneForStatus(score.status)}
        label={`${score.categoryName}: ${percent}%`}
      />
      <p className="line-clamp-2 text-center text-[0.65rem] leading-tight text-ink-secondary">
        {score.categoryName}
      </p>
    </div>
  );
};
