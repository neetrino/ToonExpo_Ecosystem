'use client';

import type {
  PortalReadinessAssessmentItem,
  PortalReadinessCriterionItem,
  PortalReadinessRequiredActionItem,
  PortalReadinessScoreItem,
} from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import {
  BuilderReadinessCategoryHelp,
  BuilderReadinessCriteriaBlock,
} from '@/features/builder/components/builder-readiness-criteria-block';
import {
  scorePercent,
  toneForStatus,
} from '@/features/builder/components/readiness-category-progress';
import { ReadinessProgressRing } from '@/features/readiness/components/readiness-progress-ring';
import { ReadinessStatusBadge } from '@/features/readiness/components/readiness-status-badge';
import { formatReadinessDate } from '@/features/readiness/utils/format-readiness-date';
import { cn } from '@/shared/ui/cn';

/** Groups that display as Yes/No list in Partners-style UI. */
const FLAG_GROUP_CODES = new Set(['payment_methods']);

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

type CriteriaBlock = {
  key: string;
  title: string;
  items: PortalReadinessCriterionItem[];
  preferFlags: boolean;
};

const collectDisplayBlocks = (
  roots: PortalReadinessCriterionItem[],
  tKpi: (key: string) => string,
): CriteriaBlock[] => {
  const blocks: CriteriaBlock[] = [];
  const topScored: PortalReadinessCriterionItem[] = [];

  for (const root of roots) {
    if (root.children.length > 0) {
      blocks.push({
        key: root.criterionId,
        title: tKpi(`criteria.${root.code}`),
        items: root.children,
        preferFlags: FLAG_GROUP_CODES.has(root.code),
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
      preferFlags: false,
    });
  }

  return blocks;
};

const OverviewCard = ({ assessment }: { assessment: PortalReadinessAssessmentItem }) => {
  const t = useTranslations('Builder.readiness');
  const tKpi = useTranslations('ReadinessKpi');
  const overallPercent = scorePercent(assessment.overallScore);

  return (
    <section className="rounded-[var(--radius-lg)] border border-border/80 bg-surface-elevated p-5 shadow-card sm:p-7">
      <h3 className="mb-6 text-lg font-semibold tracking-tight text-ink">{t('overallScore')}</h3>
      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-center lg:gap-12">
        <div className="flex flex-col items-center gap-2">
          <ReadinessProgressRing
            percent={overallPercent}
            size="lg"
            tone={toneForStatus(assessment.status)}
            label={`${t('overallScore')}: ${overallPercent}%`}
          />
          <p className="text-sm font-medium text-ink-secondary">{t('kpiScoreLabel')}</p>
        </div>

        <div className="hidden h-32 w-px bg-border lg:block" aria-hidden />

        <div className="flex flex-wrap items-start justify-center gap-8 sm:gap-10">
          {assessment.scores.map((score) => {
            const percent = scorePercent(score.score);
            const label = tKpi(`categories.${score.categoryCode}`);
            return (
              <div key={score.categoryId} className="flex w-[5.5rem] flex-col items-center gap-2">
                <ReadinessProgressRing
                  percent={percent}
                  size="md"
                  tone={toneForStatus(score.status)}
                  label={`${label}: ${percent}%`}
                />
                <p className="text-center text-sm font-semibold text-ink">{label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const CategorySection = ({ score }: { score: PortalReadinessScoreItem }) => {
  const t = useTranslations('Builder.readiness');
  const tKpi = useTranslations('ReadinessKpi');
  const categoryLabel = tKpi(`categories.${score.categoryCode}`);
  const blocks = collectDisplayBlocks(score.criteria, (key) => tKpi(key));
  const percent = scorePercent(score.score);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold tracking-tight text-ink">{categoryLabel}</h3>
          <ReadinessStatusBadge status={score.status} namespace="Builder.readiness" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold tabular-nums text-ink">{percent}%</span>
          {score.categoryWeight !== null ? (
            <span className="text-xs text-ink-muted">
              {t('categoryWeight', { weight: score.categoryWeight })}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {blocks.map((block) => (
          <BuilderReadinessCriteriaBlock
            key={block.key}
            title={block.title}
            items={block.items}
            preferFlags={block.preferFlags}
          />
        ))}
      </div>

      <BuilderReadinessCategoryHelp
        categoryName={categoryLabel}
        status={score.status}
        helpAvailable={score.helpAvailable}
        serviceProviderCategoryId={score.serviceProviderCategoryId}
        recommendationSummary={score.recommendationSummary}
      />
    </section>
  );
};

type BuilderReadinessAssessmentPanelProps = {
  assessment: PortalReadinessAssessmentItem;
};

/**
 * Builder readiness — Partners KPI layout + ToonExpo design + portal functionality.
 */
export const BuilderReadinessAssessmentPanel = ({
  assessment,
}: BuilderReadinessAssessmentPanelProps) => {
  const t = useTranslations('Builder.readiness');
  const locale = useLocale();
  const title = assessment.projectName ?? t('companyAssessment');
  const sortedActions = [...assessment.requiredActions].sort(
    (a, b) => ACTION_PRIORITY[a.status] - ACTION_PRIORITY[b.status],
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <ReadinessStatusBadge status={assessment.status} namespace="Builder.readiness" />
          <span className="text-xs font-medium tracking-wide text-ink-muted uppercase">
            {t(`targetTypes.${assessment.targetType}`)}
          </span>
        </div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-navy sm:text-3xl">
          {title}
        </h2>
        <p className="text-sm text-ink-secondary">
          {t('lastUpdated')}: {formatReadinessDate(assessment.lastEvaluatedAt, locale)}
        </p>
      </header>

      <OverviewCard assessment={assessment} />

      <div className="flex flex-col gap-8">
        {assessment.scores.map((score) => (
          <CategorySection key={score.categoryId} score={score} />
        ))}
      </div>

      {sortedActions.length > 0 ? (
        <section className="rounded-[var(--radius-md)] border border-border/80 bg-surface-elevated p-5 shadow-card">
          <h3 className="mb-1 text-base font-semibold text-ink">{t('requiredActionsTitle')}</h3>
          <p className="mb-4 text-sm text-ink-secondary">{t('requiredActionsHint')}</p>
          <ul className="flex flex-col gap-3">
            {sortedActions.map((action) => (
              <li
                key={action.id}
                className="flex flex-col gap-1 rounded-[var(--radius-sm)] border border-border/70 bg-canvas/40 px-4 py-3"
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
        </section>
      ) : null}

      {assessment.recommendations.length > 0 ? (
        <section className="rounded-[var(--radius-md)] border border-border/80 bg-surface-elevated p-5 shadow-card">
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
        </section>
      ) : null}
    </div>
  );
};
