'use client';

import type { PortalReadinessAssessmentItem } from '@toonexpo/contracts';
import { Building2 } from 'lucide-react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

import { scorePercent, toneForStatus } from '@/features/readiness/utils/readiness-score-display';
import { useCompanyProfileQuery } from '@/features/builder/hooks/use-company-profile';
import { ReadinessProgressRing } from '@/features/readiness/components/readiness-progress-ring';
import { formatReadinessDate } from '@/features/readiness/utils/format-readiness-date';
import { cn } from '@/shared/ui/cn';

type BuilderReadinessOverviewCardProps = {
  assessment: PortalReadinessAssessmentItem;
};

type ScorePairProps = {
  primary: number;
  className?: string | undefined;
};

const ScorePair = ({ primary, className }: ScorePairProps) => (
  <span className={cn('inline-flex items-baseline gap-1 tabular-nums', className)}>
    <span className="font-semibold tracking-tight text-brand">{primary}%</span>
  </span>
);

/**
 * Partners-KPI-style readiness overview: logo/title, media, ring + overall, category rows.
 * Uses ToonExpo tokens (not Partners dark theme).
 */
export const BuilderReadinessOverviewCard = ({ assessment }: BuilderReadinessOverviewCardProps) => {
  const t = useTranslations('Builder.readiness');
  const tKpi = useTranslations('ReadinessKpi');
  const locale = useLocale();
  const companyQuery = useCompanyProfileQuery();

  const companyName = companyQuery.data?.name ?? t('companyAssessment');
  const companyLogoUrl = companyQuery.data?.logoUrl ?? null;
  const title = assessment.projectName ?? t('companyAssessment');
  const overallPercent = scorePercent(assessment.overallScore);
  const tone = toneForStatus(assessment.status);
  const companyInitials = companyName.trim().slice(0, 2).toUpperCase() || '—';

  return (
    <article
      className={cn(
        'flex w-full max-w-md flex-col gap-5 overflow-hidden rounded-[var(--radius-lg)]',
        'border border-border/80 bg-surface-elevated p-5 shadow-card sm:p-6',
      )}
    >
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-surface ring-1 ring-border">
            {companyLogoUrl ? (
              <Image src={companyLogoUrl} alt="" fill className="object-cover" sizes="40px" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-ink-muted">
                {companyInitials}
              </span>
            )}
          </div>
          <p className="min-w-0 truncate text-sm font-medium text-ink-secondary">{companyName}</p>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{title}</h2>
          <p className="text-xs text-ink-muted">
            {t('lastUpdated')}: {formatReadinessDate(assessment.lastEvaluatedAt, locale)}
          </p>
        </div>
      </header>

      <div
        className={cn(
          'relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-md)]',
          'bg-surface ring-1 ring-border/60',
        )}
      >
        <span className="flex size-full flex-col items-center justify-center gap-2 text-ink-muted">
          <Building2 className="size-10 opacity-40" aria-hidden />
          <span className="max-w-[80%] truncate text-sm">{title}</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <ReadinessProgressRing
          percent={overallPercent}
          size="sm"
          tone={tone}
          showValue={false}
          label={`${t('kpiScoreLabel')}: ${overallPercent}%`}
        />
        <p className="min-w-0 flex-1 text-sm leading-snug font-medium text-ink-secondary">
          {t('kpiScoreLabel')}
        </p>
        <ScorePair primary={overallPercent} className="shrink-0 text-2xl" />
      </div>

      {assessment.scores.length > 0 ? (
        <>
          <div className="border-t border-border" aria-hidden />
          <ul className="flex flex-col gap-3">
            {assessment.scores.map((score) => {
              const percent = scorePercent(score.score);
              const label = tKpi(`categories.${score.categoryCode}`);
              return (
                <li key={score.categoryId} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm text-ink-secondary">{label}</span>
                  <ScorePair primary={percent} className="shrink-0 text-base" />
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </article>
  );
};
