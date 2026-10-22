'use client';

import { useTranslations } from 'next-intl';

import { BUILDER_READINESS_PREVIEW_ASSESSMENT } from '@/features/builder/constants/builder-readiness-preview';
import { useCompanyProfileQuery } from '@/features/builder/hooks/use-company-profile';
import { usePortalReadinessQuery } from '@/features/builder/hooks/use-portal-readiness';
import { BuilderReadinessReport } from '@/features/builder/readiness-report/builder-readiness-report';

const PREVIEW_PEER_MEDIAN_PERCENT = 46;

/**
 * Builder portal readiness page — client progress report (read-only).
 * When no assessment exists yet, shows a labeled preview sample of the full UI.
 */
export const BuilderReadinessPage = () => {
  const t = useTranslations('Builder.readiness');
  const query = usePortalReadinessQuery();
  const company = useCompanyProfileQuery();

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
  const companyName = company.data?.name ?? t('companyAssessment');
  const peerMedianPercent = isPreview ? PREVIEW_PEER_MEDIAN_PERCENT : query.data.peerMedianPercent;

  return (
    <div className="flex flex-col gap-8">
      {isPreview ? (
        <div
          role="status"
          className="rounded-[15px] border border-brand/25 bg-brand-soft/40 px-4 py-3 text-sm text-ink"
        >
          <p className="font-semibold text-brand">{t('previewBadge')}</p>
          <p className="mt-1 text-ink-secondary">{t('previewHint')}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-12">
        {displayAssessments.map((assessment) => (
          <BuilderReadinessReport
            key={assessment.id}
            assessment={assessment}
            companyName={companyName}
            logoUrl={company.data?.logoUrl ?? null}
            peerMedianPercent={peerMedianPercent}
          />
        ))}
      </div>
    </div>
  );
};
