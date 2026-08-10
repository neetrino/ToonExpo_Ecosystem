'use client';

import type { PortalReadinessAssessmentItem } from '@toonexpo/contracts';
import { Building2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { useCompanyProfileQuery } from '@/features/builder/hooks/use-company-profile';
import { ReadinessProgressRing } from '@/features/readiness/components/readiness-progress-ring';
import { scorePercent, toneForStatus } from '@/features/readiness/utils/readiness-score-display';
import { cn } from '@/shared/ui/cn';

const CARD_RADIUS_CLASS = 'rounded-[15px]';
const MEDIA_RADIUS_CLASS = 'rounded-[12px]';
const CARD_MAX_WIDTH_CLASS = 'max-w-[16.5rem]';

type BuilderReadinessOverviewCardProps = {
  assessment: PortalReadinessAssessmentItem;
};

type ScorePairProps = {
  primary: number;
  className?: string | undefined;
};

const ScorePair = ({ primary, className }: ScorePairProps) => (
  <span className={cn('font-semibold tracking-tight text-brand tabular-nums', className)}>
    {primary}%
  </span>
);

/**
 * Compact Partners-KPI readiness overview card: logo, title, cover, score ring.
 */
export const BuilderReadinessOverviewCard = ({ assessment }: BuilderReadinessOverviewCardProps) => {
  const t = useTranslations('Builder.readiness');
  const tKpi = useTranslations('ReadinessKpi');
  const companyQuery = useCompanyProfileQuery();

  const companyName = companyQuery.data?.name ?? t('companyAssessment');
  const companyLogoUrl = companyQuery.data?.logoUrl ?? null;
  const title = assessment.projectName ?? t('companyAssessment');
  const overallPercent = scorePercent(assessment.overallScore);
  const hasScore = assessment.overallScore !== null;
  const tone = toneForStatus(assessment.status);
  const companyInitials = companyName.trim().slice(0, 2).toUpperCase() || '—';
  const coverUrl = assessment.coverUrl;

  return (
    <article
      className={cn(
        'flex w-full flex-col gap-2.5 overflow-hidden border border-border/80',
        'bg-surface-elevated p-3 shadow-card',
        CARD_MAX_WIDTH_CLASS,
        CARD_RADIUS_CLASS,
      )}
    >
      <header className="flex flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2">
          <div className="relative size-7 shrink-0 overflow-hidden rounded-full bg-surface ring-1 ring-border">
            {companyLogoUrl ? (
              <Image src={companyLogoUrl} alt="" fill className="object-cover" sizes="28px" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-ink-muted">
                {companyInitials}
              </span>
            )}
          </div>
          <p className="min-w-0 truncate text-xs font-medium text-ink-secondary">{companyName}</p>
        </div>
        <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
      </header>

      <div
        className={cn(
          'relative aspect-[16/9] w-full overflow-hidden bg-surface ring-1 ring-border/60',
          MEDIA_RADIUS_CLASS,
        )}
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 16.5rem"
          />
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-1 text-ink-muted">
            <Building2 className="size-6 opacity-40" aria-hidden />
            <span className="max-w-[80%] truncate text-[10px]">{title}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ReadinessProgressRing
          percent={overallPercent}
          size="sm"
          tone={tone}
          showValue={false}
          className="size-9"
          label={`${t('overallScore')}: ${hasScore ? `${overallPercent}%` : '—'}`}
        />
        <p className="min-w-0 flex-1 text-xs leading-snug text-ink-secondary">{t('overallScore')}</p>
        {hasScore ? (
          <ScorePair primary={overallPercent} className="shrink-0 text-base" />
        ) : (
          <span className="shrink-0 text-base tabular-nums text-ink-muted">—</span>
        )}
      </div>

      {assessment.scores.length > 0 ? (
        <>
          <div className="border-t border-border" aria-hidden />
          <ul className="flex flex-col gap-1.5">
            {assessment.scores.map((score) => {
              const percent = scorePercent(score.score);
              const label = tKpi(`categories.${score.categoryCode}`);
              return (
                <li key={score.categoryId} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-xs text-ink-secondary">{label}</span>
                  <ScorePair primary={percent} className="shrink-0 text-xs" />
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </article>
  );
};
