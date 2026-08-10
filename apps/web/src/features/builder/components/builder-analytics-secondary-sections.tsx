'use client';

import type {
  CrmDealStatus,
  PortalAnalyticsOverview,
  RequestSource,
} from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { AnalyticsBarRow } from '@/features/analytics/components/analytics-bar-row';
import { AnalyticsEntityRankList } from '@/features/analytics/components/analytics-entity-rank-list';
import { AnalyticsSectionCard } from '@/features/analytics/components/analytics-section-card';
import { scorePercent } from '@/features/readiness/utils/readiness-score-display';
import { ReadinessStatusBadge } from '@/features/readiness/components/readiness-status-badge';
import { StaggerGroup } from '@/shared/ui/motion';

const maxCount = (values: number[]): number => (values.length > 0 ? Math.max(...values) : 0);
const SECONDARY_STAGGER_MS = 80;
const SECONDARY_BASE_DELAY_MS = 420;
const TOP_FAVORITES_LIMIT = 5;

type BuilderAnalyticsSecondarySectionsProps = {
  data: PortalAnalyticsOverview;
};

/**
 * Secondary builder analytics blocks below the primary dashboard.
 */
export const BuilderAnalyticsSecondarySections = ({
  data,
}: BuilderAnalyticsSecondarySectionsProps) => {
  const t = useTranslations('Builder.analytics');
  const tCommon = useTranslations('Analytics.common');
  const tCrm = useTranslations('Analytics.crmStatuses');
  const tSources = useTranslations('Analytics.requestSources');
  const tSales = useTranslations('Analytics.apartmentSales');
  const tReadiness = useTranslations('Builder.readiness');

  const requestMax = maxCount([
    data.requests.total,
    ...data.requests.bySource.map((item) => item.count),
  ]);
  const dealMax = maxCount(data.dealsByStatus.map((item) => item.count));
  const salesMax = maxCount([
    data.apartmentSalesStatus.available,
    data.apartmentSalesStatus.reserved,
    data.apartmentSalesStatus.sold,
  ]);

  return (
    <StaggerGroup
      force
      className="grid grid-cols-1 gap-4 lg:grid-cols-2 [&>*]:h-full [&>*]:min-w-0 [&>*:last-child]:lg:col-span-2"
      staggerMs={SECONDARY_STAGGER_MS}
      baseDelayMs={SECONDARY_BASE_DELAY_MS}
      durationMs={560}
    >
      <AnalyticsSectionCard title={t('sections.requests')} className="h-full">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-muted">{t('requests.total')}</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{data.requests.total}</p>
          </div>
          {data.requests.bySource.length === 0 ? (
            <p className="text-sm text-ink-secondary">{tCommon('empty')}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.requests.bySource.map((item) => (
                <AnalyticsBarRow
                  key={item.source}
                  label={tSources(item.source as RequestSource)}
                  value={item.count}
                  max={requestMax}
                />
              ))}
            </div>
          )}
        </div>
      </AnalyticsSectionCard>

      <AnalyticsSectionCard
        title={t('sections.topProjectsByFavorites')}
        empty={data.favorites.topProjects.length === 0}
        emptyLabel={tCommon('empty')}
        className="h-full"
      >
        <AnalyticsEntityRankList
          items={data.favorites.topProjects.slice(0, TOP_FAVORITES_LIMIT).map((item) => ({
            entityId: item.entityId,
            name: item.name,
            viewCount: item.favoriteCount,
          }))}
          rankLabel={t('table.rank')}
          nameLabel={t('table.name')}
          viewsLabel={t('table.favorites')}
          emptyLabel={tCommon('empty')}
        />
      </AnalyticsSectionCard>

      <AnalyticsSectionCard
        title={t('sections.dealsByStatus')}
        empty={data.dealsByStatus.length === 0}
        emptyLabel={tCommon('empty')}
        className="h-full"
      >
        <div className="flex flex-col gap-3">
          {data.dealsByStatus.map((item) => (
            <AnalyticsBarRow
              key={item.status}
              label={tCrm(item.status as CrmDealStatus)}
              value={item.count}
              max={dealMax}
            />
          ))}
        </div>
      </AnalyticsSectionCard>

      <AnalyticsSectionCard title={t('sections.apartmentSales')} className="h-full">
        <div className="flex flex-col gap-3">
          <AnalyticsBarRow
            label={tSales('available')}
            value={data.apartmentSalesStatus.available}
            max={salesMax}
          />
          <AnalyticsBarRow
            label={tSales('reserved')}
            value={data.apartmentSalesStatus.reserved}
            max={salesMax}
          />
          <AnalyticsBarRow
            label={tSales('sold')}
            value={data.apartmentSalesStatus.sold}
            max={salesMax}
          />
        </div>
      </AnalyticsSectionCard>

      <AnalyticsSectionCard title={t('sections.readiness')} className="h-full">
        <div className="grid gap-4 sm:grid-cols-2">
          <ReadinessMetric
            title={t('readiness.company')}
            status={data.readiness.companyStatus}
            score={data.readiness.companyOverallScore}
            noDataLabel={tCommon('empty')}
            overallLabel={tReadiness('overallScore')}
          />
          <ReadinessMetric
            title={t('readiness.project')}
            status={data.readiness.projectStatus}
            score={data.readiness.projectOverallScore}
            noDataLabel={tCommon('empty')}
            overallLabel={tReadiness('overallScore')}
          />
        </div>
      </AnalyticsSectionCard>
    </StaggerGroup>
  );
};

type ReadinessMetricProps = {
  title: string;
  status: Parameters<typeof ReadinessStatusBadge>[0]['status'] | null;
  score: number | null;
  noDataLabel: string;
  overallLabel: string;
};

const ReadinessMetric = ({
  title,
  status,
  score,
  noDataLabel,
  overallLabel,
}: ReadinessMetricProps) => (
  <div className="rounded-[12px] border border-border/70 bg-canvas/40 p-4">
    <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{title}</p>
    {status ? (
      <div className="mt-3 flex flex-col gap-2">
        <ReadinessStatusBadge status={status} namespace="Builder.readiness" />
        <p className="text-sm text-ink-secondary">
          {overallLabel}: {score === null ? '—' : `${scorePercent(score)}%`}
        </p>
      </div>
    ) : (
      <p className="mt-3 text-sm text-ink-secondary">{noDataLabel}</p>
    )}
  </div>
);
