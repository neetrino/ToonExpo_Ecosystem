'use client';

import { ClipboardCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { BuilderReadinessAssessmentPanel } from '@/features/builder/components/builder-readiness-assessment-panel';
import { BUILDER_READINESS_PREVIEW_ASSESSMENT } from '@/features/builder/constants/builder-readiness-preview';
import { usePortalReadinessQuery } from '@/features/builder/hooks/use-portal-readiness';
import { PageTitleBlock } from '@/shared/ui/page-title-icon';

/**
 * Builder portal readiness page — KPI overview + criterion detail (read-only).
 * When no assessment exists yet, shows a labeled preview sample of the full UI.
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
  const isPreview = assessments.length === 0;
  const displayAssessments = isPreview ? [BUILDER_READINESS_PREVIEW_ASSESSMENT] : assessments;

  return (
    <div className="flex flex-col gap-6">
      <PageTitleBlock title={t('title')} subtitle={t('subtitle')} icon={ClipboardCheck} />

      {isPreview ? (
        <div
          role="status"
          className="rounded-[15px] border border-brand/25 bg-brand-soft/40 px-4 py-3 text-sm text-ink"
        >
          <p className="font-semibold text-brand">{t('previewBadge')}</p>
          <p className="mt-1 text-ink-secondary">{t('previewHint')}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-10">
        {displayAssessments.map((assessment) => (
          <BuilderReadinessAssessmentPanel key={assessment.id} assessment={assessment} />
        ))}
      </div>
    </div>
  );
};
