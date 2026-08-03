'use client';

import type { PortalReadinessCriterionItem, ReadinessScoreStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ReadinessHelpDialog } from '@/features/builder/components/readiness-help-dialog';
import { ReadinessProgressRing } from '@/features/readiness/components/readiness-progress-ring';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';

type BuilderReadinessCriterionRingProps = {
  item: PortalReadinessCriterionItem;
};

/**
 * Criterion ring — Partners listing style, ToonExpo tokens.
 */
export const BuilderReadinessCriterionRing = ({ item }: BuilderReadinessCriterionRingProps) => {
  const t = useTranslations('ReadinessKpi');
  const percent = item.percent ?? 0;
  const label = t(`criteria.${item.code}`);

  return (
    <div className="flex w-[7.25rem] flex-col items-center gap-2.5 sm:w-[8.25rem]">
      <ReadinessProgressRing
        percent={percent}
        size="xs"
        tone="brand"
        label={`${label}: ${percent}%`}
      />
      <p className="line-clamp-3 text-center text-[0.7rem] leading-snug font-medium text-ink">
        {label}
      </p>
    </div>
  );
};

type BuilderReadinessFlagRowProps = {
  item: PortalReadinessCriterionItem;
};

/**
 * Read-only Yes/No row matching Partners payment-methods pattern.
 */
export const BuilderReadinessFlagRow = ({ item }: BuilderReadinessFlagRowProps) => {
  const t = useTranslations('ReadinessKpi');
  const tPage = useTranslations('Builder.readiness');
  const label = t(`criteria.${item.code}`);
  const yes = item.checked || (item.value !== null && item.value > 0);

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <p className="min-w-0 flex-1 text-sm text-ink">{label}</p>
      <div className="flex shrink-0 overflow-hidden rounded-md border border-border">
        <span
          className={cn(
            'px-3 py-1.5 text-xs font-semibold',
            yes ? 'bg-success text-on-dark' : 'bg-surface text-ink-muted',
          )}
        >
          {tPage('flagYes')}
        </span>
        <span
          className={cn(
            'px-3 py-1.5 text-xs font-semibold',
            !yes ? 'bg-ink-muted text-on-dark' : 'bg-surface text-ink-muted',
          )}
        >
          {tPage('flagNo')}
        </span>
      </div>
    </div>
  );
};

type BuilderReadinessCriteriaBlockProps = {
  title: string;
  items: PortalReadinessCriterionItem[];
  /** When true, scored children render as Yes/No (e.g. payment methods group). */
  preferFlags?: boolean | undefined;
};

/**
 * Criteria card — rings and/or Yes/No flags.
 */
export const BuilderReadinessCriteriaBlock = ({
  title,
  items,
  preferFlags = false,
}: BuilderReadinessCriteriaBlockProps) => {
  const scored = preferFlags
    ? []
    : items.filter((item) => item.maxPoints !== null && item.maxPoints > 0);
  const flags = preferFlags
    ? items
    : items.filter((item) => item.maxPoints === null || item.maxPoints <= 0);

  if (scored.length === 0 && flags.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[var(--radius-md)] border border-border/80 bg-surface-elevated p-5 shadow-card">
      {title ? (
        <h3 className="mb-5 text-base font-semibold tracking-tight text-ink">{title}</h3>
      ) : null}
      {scored.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-6 sm:justify-start">
          {scored.map((item) => (
            <BuilderReadinessCriterionRing key={item.criterionId} item={item} />
          ))}
        </div>
      ) : null}
      {flags.length > 0 ? (
        <div
          className={cn(
            'divide-y divide-border/60',
            scored.length > 0 && 'mt-4 border-t border-border/60 pt-2',
          )}
        >
          {flags.map((item) => (
            <BuilderReadinessFlagRow key={item.criterionId} item={item} />
          ))}
        </div>
      ) : null}
    </section>
  );
};

type BuilderReadinessCategoryHelpProps = {
  categoryName: string;
  status: ReadinessScoreStatus;
  helpAvailable: boolean;
  serviceProviderCategoryId: string | null;
  recommendationSummary: string | null;
};

/**
 * Category tip + optional help providers CTA.
 */
export const BuilderReadinessCategoryHelp = ({
  categoryName,
  status,
  helpAvailable,
  serviceProviderCategoryId,
  recommendationSummary,
}: BuilderReadinessCategoryHelpProps) => {
  const t = useTranslations('Builder.readiness');
  const [helpOpen, setHelpOpen] = useState(false);
  const showHelp =
    helpAvailable &&
    serviceProviderCategoryId != null &&
    (status === 'needs_improvement' || status === 'in_progress');

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-ink-secondary">
          {recommendationSummary ?? t(`statusHints.${status}`)}
        </p>
        {showHelp ? (
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
        ) : null}
      </div>
      {helpOpen && serviceProviderCategoryId ? (
        <ReadinessHelpDialog
          categoryName={categoryName}
          categoryId={serviceProviderCategoryId}
          onClose={() => {
            setHelpOpen(false);
          }}
        />
      ) : null}
    </>
  );
};
