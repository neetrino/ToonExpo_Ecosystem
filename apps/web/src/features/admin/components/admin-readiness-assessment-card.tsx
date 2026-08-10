'use client';

import type { ReadinessAssessmentListItem, ReadinessScoreStatus } from '@toonexpo/contracts';
import { Building2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { ReadinessProgressRing } from '@/features/readiness/components/readiness-progress-ring';
import { scorePercent, toneForStatus } from '@/features/readiness/utils/readiness-score-display';
import { cn } from '@/shared/ui/cn';
import { LIST_CARD_LIFT_CLASS } from '@/shared/ui/motion';

export type AdminReadinessCompanyInfo = {
  name: string;
  logoUrl: string | null;
};

type AdminReadinessAssessmentCardProps = {
  assessment: ReadinessAssessmentListItem;
  company: AdminReadinessCompanyInfo;
  onOpen: () => void;
};

type ScorePairProps = {
  primary: number | null;
  className?: string | undefined;
};

const ScorePair = ({ primary, className }: ScorePairProps) => {
  if (primary === null) {
    return <span className={cn('tabular-nums text-ink-muted', className)}>—</span>;
  }
  return (
    <span className={cn('font-semibold tracking-tight text-brand tabular-nums', className)}>
      {primary}%
    </span>
  );
};

/**
 * Admin readiness list card — Partners KPI layout, ToonExpo tokens.
 */
export const AdminReadinessAssessmentCard = ({
  assessment,
  company,
  onOpen,
}: AdminReadinessAssessmentCardProps) => {
  const t = useTranslations('Admin.readiness.assessments');
  const tMgmt = useTranslations('Admin.readiness.management');
  const tKpi = useTranslations('ReadinessKpi');

  const categories = assessment.categories ?? [];
  const title = assessment.projectName ?? company.name;
  const overallPercent = scorePercent(assessment.overallScore);
  const hasScore = assessment.overallScore !== null;
  const tone = toneForStatus(assessment.status as ReadinessScoreStatus);
  const initials = company.name.trim().slice(0, 2).toUpperCase() || '—';
  const coverUrl = assessment.coverUrl ?? null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'flex h-full w-full flex-col gap-3.5 overflow-hidden rounded-[20px]',
        'border border-border/80 bg-surface-elevated p-4 text-left shadow-card',
        LIST_CARD_LIFT_CLASS,
      )}
    >
      <header className="flex flex-col gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-surface ring-1 ring-border">
            {company.logoUrl ? (
              <Image src={company.logoUrl} alt="" fill className="object-cover" sizes="36px" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-ink-muted">
                {initials}
              </span>
            )}
          </div>
          <p className="min-w-0 truncate text-sm font-medium text-ink-secondary">{company.name}</p>
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      </header>

      <div
        className={cn(
          'relative aspect-[16/10] w-full overflow-hidden rounded-[14px]',
          'bg-surface ring-1 ring-border/60',
        )}
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-1.5 text-ink-muted">
            <Building2 className="size-8 opacity-40" aria-hidden />
            <span className="max-w-[80%] truncate text-xs">{title}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ReadinessProgressRing
          percent={overallPercent}
          size="sm"
          tone={tone}
          showValue={false}
          className="size-12"
          label={`${tMgmt('overallScore')}: ${hasScore ? `${overallPercent}%` : '—'}`}
        />
        <p className="min-w-0 flex-1 text-sm leading-snug text-ink-secondary">
          {tMgmt('overallScore')}
        </p>
        <ScorePair primary={hasScore ? overallPercent : null} className="text-xl" />
      </div>

      {categories.length > 0 ? (
        <>
          <div className="border-t border-border" aria-hidden />
          <ul className="flex flex-col gap-2.5">
            {categories.map((category) => {
              const percent = scorePercent(category.score);
              const hasCategoryScore = category.score !== null;
              return (
                <li key={category.categoryId} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm text-ink-secondary">
                    {tKpi(`categories.${category.categoryCode}`)}
                  </span>
                  <ScorePair primary={hasCategoryScore ? percent : null} className="text-sm" />
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      <span className="sr-only">{t('openToScore')}</span>
    </button>
  );
};
