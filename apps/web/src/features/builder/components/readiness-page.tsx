'use client';

import { ClipboardCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { BuilderReadinessAssessmentPanel } from '@/features/builder/components/builder-readiness-assessment-panel';
import { usePortalReadinessQuery } from '@/features/builder/hooks/use-portal-readiness';
import { EmptyState } from '@/shared/ui/empty-state';
import { PageTitleBlock } from '@/shared/ui/page-title-icon';

/**
 * Builder portal readiness page — KPI overview + criterion detail (read-only).
 */
export const BuilderReadinessPage = () => {
  const t = useTranslations('Builder.readiness');
  const query = usePortalReadinessQuery();

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const assessments = query.data.data;

  return (
    <div className="flex flex-col gap-6">
      <PageTitleBlock title={t('title')} subtitle={t('subtitle')} icon={ClipboardCheck} />

      {assessments.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('empty')} />
      ) : (
        <div className="flex flex-col gap-10">
          {assessments.map((assessment) => (
            <BuilderReadinessAssessmentPanel key={assessment.id} assessment={assessment} />
          ))}
        </div>
      )}
    </div>
  );
};
