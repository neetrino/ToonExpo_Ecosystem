'use client';

import type { PortalReadinessAssessmentItem } from '@toonexpo/contracts';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useCompanyProfileQuery } from '@/features/builder/hooks/use-company-profile';
import {
  ReadinessKpiCard,
  type ReadinessKpiCategoryRow,
} from '@/features/readiness/components/readiness-kpi-card';
import { scorePercent } from '@/features/readiness/utils/readiness-score-display';
import { cn } from '@/shared/ui/cn';

type BuilderReadinessOverviewCardProps = {
  assessment: PortalReadinessAssessmentItem;
  expanded: boolean;
  detailId: string;
  onToggle: () => void;
};

const toKpiCategories = (
  assessment: PortalReadinessAssessmentItem,
): ReadinessKpiCategoryRow[] =>
  assessment.scores.map((score) => ({
    id: score.categoryId,
    code: score.categoryCode,
    percent: scorePercent(score.score),
    hasScore: score.score !== null,
  }));

/**
 * Builder readiness overview — same card size/style as `/admin/companies`.
 */
export const BuilderReadinessOverviewCard = ({
  assessment,
  expanded,
  detailId,
  onToggle,
}: BuilderReadinessOverviewCardProps) => {
  const t = useTranslations('Builder.readiness');
  const tKpi = useTranslations('ReadinessKpi');
  const companyQuery = useCompanyProfileQuery();
  const companyName = companyQuery.data?.name ?? t('companyAssessment');
  const title = assessment.projectName ?? t('companyAssessment');
  const overallPercent = scorePercent(assessment.overallScore);

  return (
    <ReadinessKpiCard
      companyName={companyName}
      companyLogoUrl={companyQuery.data?.logoUrl ?? null}
      title={title}
      coverUrl={assessment.coverUrl}
      overallPercent={overallPercent}
      overallHasScore={assessment.overallScore !== null}
      overallLabel={t('overallScore')}
      categories={toKpiCategories(assessment)}
      categoryLabel={(code) => tKpi(`categories.${code}`)}
      onClick={onToggle}
      ariaExpanded={expanded}
      ariaControls={detailId}
      ariaLabel={expanded ? t('collapseDetails') : t('expandDetails')}
      headerTrailing={
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-ink-muted transition-transform duration-[var(--duration-base)]',
            expanded ? 'rotate-180' : 'rotate-0',
          )}
          aria-hidden
        />
      }
    />
  );
};
