'use client';

import type {
  PortalReadinessAssessmentItem,
  PortalReadinessRequiredActionItem,
} from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import {
  BuilderReadinessCategoryGauge,
  BuilderReadinessCategoryProgressRow,
  scorePercent,
  toneForStatus,
} from '@/features/builder/components/readiness-category-progress';
import { ReadinessProgressRing } from '@/features/readiness/components/readiness-progress-ring';
import { ReadinessStatusBadge } from '@/features/readiness/components/readiness-status-badge';
import { formatReadinessDate } from '@/features/readiness/utils/format-readiness-date';
import { barFillColSpanClass } from '@/features/analytics/utils/bar-fill-span';
import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/ui/cn';

/** Visual progress for required-action status (UI only). */
const ACTION_STATUS_PERCENT: Record<PortalReadinessRequiredActionItem['status'], number> = {
  open: 20,
  in_progress: 55,
  done: 100,
  blocked: 10,
  cancelled: 0,
};

const actionBarClass = (status: PortalReadinessRequiredActionItem['status']): string => {
  if (status === 'done') {
    return 'bg-success';
  }
  if (status === 'blocked' || status === 'cancelled') {
    return 'bg-danger';
  }
  if (status === 'in_progress') {
    return 'bg-brand';
  }
  return 'bg-warning';
};

type BuilderReadinessAssessmentPanelProps = {
  assessment: PortalReadinessAssessmentItem;
};

/**
 * Builder readiness assessment — analytics-style overview for one assessment.
 */
export const BuilderReadinessAssessmentPanel = ({
  assessment,
}: BuilderReadinessAssessmentPanelProps) => {
  const t = useTranslations('Builder.readiness');
  const locale = useLocale();
  const overallPercent = scorePercent(assessment.overallScore);
  const title = assessment.projectName ?? t('companyAssessment');
  const hasActions = assessment.requiredActions.length > 0;
  const hasRecommendations = assessment.recommendations.length > 0;

  return (
    <Card variant="elevated" padding="none" className="overflow-hidden">
      <div className="flex flex-col gap-1 border-b border-border/60 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">
            {t(`targetTypes.${assessment.targetType}`)}
          </p>
          <ReadinessStatusBadge status={assessment.status} namespace="Builder.readiness" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
        <p className="text-sm text-ink-secondary">
          {t('lastUpdated')}: {formatReadinessDate(assessment.lastEvaluatedAt, locale)}
        </p>
      </div>

      <div className="grid gap-6 border-b border-border/60 px-5 py-6 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <h3 className="mb-4 text-xs font-medium tracking-wide text-ink-muted uppercase">
            {t('highlightsTitle')}
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-4">
            {assessment.scores.map((score) => (
              <BuilderReadinessCategoryGauge key={score.categoryId} score={score} />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 justify-self-center lg:justify-self-end">
          <ReadinessProgressRing
            percent={overallPercent}
            size="lg"
            tone={toneForStatus(assessment.status)}
            label={`${t('overallScore')}: ${overallPercent}%`}
          />
          <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">
            {t('overallScore')}
          </p>
        </div>
      </div>

      <div className="border-b border-border/60 px-5 py-5 sm:px-6">
        <h3 className="mb-1 text-xs font-medium tracking-wide text-ink-muted uppercase">
          {t('categoriesTitle')}
        </h3>
        <div className="divide-y divide-border/50">
          {assessment.scores.map((score) => (
            <BuilderReadinessCategoryProgressRow key={score.categoryId} score={score} />
          ))}
        </div>
      </div>

      {hasActions || hasRecommendations ? (
        <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-2">
          {hasActions ? (
            <div>
              <h3 className="mb-3 text-xs font-medium tracking-wide text-ink-muted uppercase">
                {t('requiredActionsTitle')}
              </h3>
              <ul className="flex flex-col gap-4">
                {assessment.requiredActions.map((action) => {
                  const percent = ACTION_STATUS_PERCENT[action.status];
                  const spanClass = barFillColSpanClass(percent, 100);
                  return (
                    <li key={action.id} className="flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink">{action.title}</p>
                          {action.description ? (
                            <p className="mt-0.5 text-xs text-ink-secondary">
                              {action.description}
                            </p>
                          ) : null}
                        </div>
                        <span className="shrink-0 text-xs font-medium text-ink-muted">
                          {t(`actionStatuses.${action.status}`)}
                        </span>
                      </div>
                      <div
                        className="grid h-2 grid-cols-10 overflow-hidden rounded-pill bg-surface"
                        role="presentation"
                      >
                        {spanClass ? (
                          <div
                            className={cn(
                              'h-full rounded-pill',
                              actionBarClass(action.status),
                              spanClass,
                            )}
                          />
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {hasRecommendations ? (
            <div>
              <h3 className="mb-3 text-xs font-medium tracking-wide text-ink-muted uppercase">
                {t('recommendationsTitle')}
              </h3>
              <ul className="flex flex-col gap-3">
                {assessment.recommendations.map((rec) => (
                  <li key={rec.id} className="border-l-2 border-brand pl-3">
                    <p className="text-sm font-medium text-ink">{rec.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-secondary">
                      {rec.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
};
