'use client';

import type { PortalReadinessCriterionItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { ReadinessProgressRing } from '@/features/readiness/components/readiness-progress-ring';
import { cn } from '@/shared/ui/cn';

type BuilderReadinessCriterionRingProps = {
  item: PortalReadinessCriterionItem;
};

/**
 * Labeled criterion ring for builder readiness detail.
 */
export const BuilderReadinessCriterionRing = ({ item }: BuilderReadinessCriterionRingProps) => {
  const t = useTranslations('ReadinessKpi');
  const percent = item.percent ?? 0;
  const label = t(`criteria.${item.code}`);

  return (
    <div className="flex w-[7.5rem] flex-col items-center gap-2 sm:w-32">
      <ReadinessProgressRing
        percent={percent}
        size="xs"
        tone="brand"
        label={`${label}: ${percent}%`}
      />
      <p className="line-clamp-3 text-center text-[0.65rem] leading-snug font-medium tracking-wide text-ink uppercase">
        {label}
      </p>
    </div>
  );
};

type BuilderReadinessFlagRowProps = {
  item: PortalReadinessCriterionItem;
};

/**
 * Yes/No availability row for non-scored criteria.
 */
export const BuilderReadinessFlagRow = ({ item }: BuilderReadinessFlagRowProps) => {
  const t = useTranslations('ReadinessKpi');
  const tPage = useTranslations('Builder.readiness');
  const label = t(`criteria.${item.code}`);
  const yes = item.checked || (item.value !== null && item.value > 0);

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/50 py-2.5 last:border-b-0">
      <p className="min-w-0 flex-1 text-sm text-ink">{label}</p>
      <span
        className={cn(
          'shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold',
          yes ? 'bg-success/15 text-success' : 'bg-surface text-ink-muted',
        )}
      >
        {yes ? tPage('flagYes') : tPage('flagNo')}
      </span>
    </div>
  );
};

type BuilderReadinessCriteriaBlockProps = {
  title: string;
  items: PortalReadinessCriterionItem[];
};

/**
 * Renders scored rings and/or yes-no flags for a criterion group.
 */
export const BuilderReadinessCriteriaBlock = ({
  title,
  items,
}: BuilderReadinessCriteriaBlockProps) => {
  const scored = items.filter((item) => item.maxPoints !== null && item.maxPoints > 0);
  const flags = items.filter((item) => item.maxPoints === null || item.maxPoints <= 0);

  if (scored.length === 0 && flags.length === 0) {
    return null;
  }

  return (
    <section className="rounded-md border border-border bg-surface-elevated p-4 shadow-xs sm:p-5">
      {title ? <h3 className="mb-4 text-base font-semibold text-ink">{title}</h3> : null}
      {scored.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-5 sm:justify-start">
          {scored.map((item) => (
            <BuilderReadinessCriterionRing key={item.criterionId} item={item} />
          ))}
        </div>
      ) : null}
      {flags.length > 0 ? (
        <div className={cn(scored.length > 0 && 'mt-4 border-t border-border/60 pt-3')}>
          {flags.map((item) => (
            <BuilderReadinessFlagRow key={item.criterionId} item={item} />
          ))}
        </div>
      ) : null}
    </section>
  );
};
