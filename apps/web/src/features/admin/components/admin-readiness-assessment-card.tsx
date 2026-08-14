'use client';

import type { ReadinessAssessmentListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import {
  ReadinessKpiCard,
  type ReadinessKpiCategoryRow,
} from '@/features/readiness/components/readiness-kpi-card';
import { scorePercent } from '@/features/readiness/utils/readiness-score-display';

export type AdminReadinessCompanyInfo = {
  name: string;
  logoUrl: string | null;
};

type AdminReadinessAssessmentCardProps = {
  assessment: ReadinessAssessmentListItem;
  company: AdminReadinessCompanyInfo;
  onOpen: () => void;
};

const toKpiCategories = (assessment: ReadinessAssessmentListItem): ReadinessKpiCategoryRow[] =>
  (assessment.categories ?? []).map((category) => ({
    id: category.categoryId,
    code: category.categoryCode,
    percent: scorePercent(category.score),
    hasScore: category.score !== null,
  }));

/**
 * Admin readiness list card — project KPI chrome with company branding.
 */
export const AdminReadinessAssessmentCard = ({
  assessment,
  company,
  onOpen,
}: AdminReadinessAssessmentCardProps) => {
  const t = useTranslations('Admin.readiness.assessments');
  const tMgmt = useTranslations('Admin.readiness.management');
  const tKpi = useTranslations('ReadinessKpi');
  const title = assessment.projectName ?? company.name;
  const overallPercent = scorePercent(assessment.overallScore);

  return (
    <ReadinessKpiCard
      companyName={company.name}
      companyLogoUrl={company.logoUrl}
      title={title}
      coverUrl={assessment.coverUrl ?? company.logoUrl}
      overallPercent={overallPercent}
      overallHasScore={assessment.overallScore !== null}
      overallLabel={tMgmt('overallScore')}
      categories={toKpiCategories(assessment)}
      categoryLabel={(code) => tKpi(`categories.${code}`)}
      onClick={onOpen}
      srOnlyAction={t('openToScore')}
    />
  );
};
