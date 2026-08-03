'use client';

import type {
  PortalReadinessAssessmentItem,
  PortalReadinessCriterionItem,
  PortalReadinessRequiredActionItem,
} from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import { BuilderReadinessCriteriaBlock } from '@/features/builder/components/builder-readiness-criteria-block';
import {
  scorePercent,
  toneForStatus,
} from '@/features/builder/components/readiness-category-progress';
import { ReadinessProgressRing } from '@/features/readiness/components/readiness-progress-ring';
import { ReadinessStatusBadge } from '@/features/readiness/components/readiness-status-badge';
import { formatReadinessDate } from '@/features/readiness/utils/format-readiness-date';
import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/ui/cn';

const ACTION_PRIORITY: Record<PortalReadinessRequiredActionItem['status'], number> = {
  open: 0,
  in_progress: 1,
  blocked: 2,
  done: 3,
  cancelled: 4,
};

const actionToneClass = (status: PortalReadinessRequiredActionItem['status']): string => {
  if (status === 'done') {
    return 'bg-success/15 text-success';
  }
  if (status === 'blocked') {
    return 'bg-warning/15 text-warning';
  }
  if (status === 'cancelled') {
    return 'bg-surface text-ink-muted';
  }
  if (status === 'in_progress') {
    return 'bg-brand/10 text-brand';
  }
  return 'bg-danger/10 text-danger';
};

const collectDisplayBlocks = (
  roots: PortalReadinessCriterionItem[],
  tKpi: (key: string) => string,
): Array<{ key: string; title: string; items: PortalReadinessCriterionItem[] }> => {
  const blocks: Array<{ key: string; title: string; items: PortalReadinessCriterionItem[] }> = [];
  const topScored: PortalReadinessCriterionItem[] = [];

  for (const root of roots) {
    if (root.children.length > 0) {
      blocks.push({
        key: root.criterionId,
        title: tKpi(`criteria.${root.code}`),
        items: root.children,
      });
      continue;
    }
    topScored.push(root);
  }

  if (topScored.length > 0) {
    blocks.unshift({
      key: 'top-scored',
      title: '',
      items: topScored,
    });
  }

  return blocks;
};

type BuilderReadinessAssessmentPanelProps = {
  assessment: PortalReadinessAssessmentItem;
};

/**
 * Builder readiness panel matching Toon Partners listing KPI layout.
 */
export const BuilderReadinessAssessmentPanel = ({
  assessment,
}: BuilderReadinessAssessmentPanelProps) => {
  const t = useTranslations('Builder.readiness');
  const tKpi = useTranslations('ReadinessKpi');
  const locale = useLocale();
  const overallPercent = scorePercent(assessment.overallScore);
  const title = assessment.projectName ?? t('companyAssessment');
  const sortedActions = [...assessment.requiredActions].sort(
    (a, b) => ACTION_PRIORITY[a.status] - ACTION_PRIORITY[b.status],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <ReadinessStatusBadge status={assessment.status} namespace="Builder.readiness" />
          <span className="text-xs text-ink-muted">
            {t(`targetTypes.${assessment.targetType}`)}
          </span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">{title}</h2>
        <p className="text-sm text-ink-secondary">
          {t('lastUpdated')}: {formatReadinessDate(assessment.lastEvaluatedAt, locale)}
        </p>
      </div>

      <Card variant="elevated" padding="lg" className="overflow-hidden">
        <h3 className="mb-5 text-lg font-semibold text-ink">{t('overallScore')}</h3>
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-center lg:gap-10">
          <div className="flex flex-col items-center gap-2">
            <ReadinessProgressRing
              percent={overallPercent}
              size="lg"
              tone={toneForStatus(assessment.status)}
              label={`${t('overallScore')}: ${overallPercent}%`}
            />
            <p className="text-sm font-medium text-ink-secondary">{t('overallScore')}</p>
          </div>

          <div className="hidden h-28 w-px bg-border lg:block" aria-hidden />

          <div className="flex flex-wrap items-start justify-center gap-6 sm:gap-8">
            {assessment.scores.map((score) => {
              const percent = scorePercent(score.score);
              const label = tKpi(`categories.${score.categoryCode}`);
              return (
                <div key={score.categoryId} className="flex w-24 flex-col items-center gap-2">
                  <ReadinessProgressRing
                    percent={percent}
                    size="md"
                    tone={toneForStatus(score.status)}
                    label={`${label}: ${percent}%`}
                  />
                  <p className="text-center text-sm font-medium text-ink">{label}</p>
                  {score.categoryWeight !== null ? (
                    <p className="text-xs text-ink-muted">
                      {t('categoryWeight', { weight: score.categoryWeight })}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {assessment.scores.map((score) => {
        const categoryLabel = tKpi(`categories.${score.categoryCode}`);
        const blocks = collectDisplayBlocks(score.criteria, (key) => tKpi(key));
        if (blocks.length === 0) {
          return null;
        }

        return (
          <section key={score.categoryId} className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h3 className="text-lg font-semibold text-ink">{categoryLabel}</h3>
              <p className="text-sm tabular-nums text-ink-secondary">
                {scorePercent(score.score)}%
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {blocks.map((block) => (
                <BuilderReadinessCriteriaBlock
                  key={block.key}
                  title={block.title}
                  items={block.items}
                />
              ))}
            </div>
            {score.recommendationSummary ? (
              <p className="text-sm leading-relaxed text-ink-secondary">
                {score.recommendationSummary}
              </p>
            ) : null}
          </section>
        );
      })}

      {sortedActions.length > 0 ? (
        <Card variant="elevated" padding="md">
          <h3 className="mb-1 text-base font-semibold text-ink">{t('requiredActionsTitle')}</h3>
          <p className="mb-4 text-sm text-ink-secondary">{t('requiredActionsHint')}</p>
          <ul className="flex flex-col gap-3">
            {sortedActions.map((action) => (
              <li
                key={action.id}
                className="flex flex-col gap-1 rounded-md border border-border/70 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{action.title}</p>
                  <span
                    className={cn(
                      'rounded-md px-2 py-0.5 text-xs font-medium',
                      actionToneClass(action.status),
                    )}
                  >
                    {t(`actionStatuses.${action.status}`)}
                  </span>
                </div>
                {action.description ? (
                  <p className="text-sm text-ink-secondary">{action.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {assessment.recommendations.length > 0 ? (
        <Card variant="elevated" padding="md">
          <h3 className="mb-1 text-base font-semibold text-ink">{t('recommendationsTitle')}</h3>
          <p className="mb-4 text-sm text-ink-secondary">{t('recommendationsHint')}</p>
          <ul className="flex flex-col gap-3">
            {assessment.recommendations.map((rec) => (
              <li key={rec.id} className="border-l-2 border-brand pl-3">
                <p className="text-sm font-semibold text-ink">{rec.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-secondary">
                  {rec.description}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
};
