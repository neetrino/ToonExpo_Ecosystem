'use client';

import type { CrmDealStatus, RequestSource } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { AnalyticsBarRow } from '@/features/analytics/components/analytics-bar-row';
import { AnalyticsDateRangeFilter } from '@/features/analytics/components/analytics-date-range-filter';
import { AnalyticsEntityRankList } from '@/features/analytics/components/analytics-entity-rank-list';
import { AnalyticsSectionCard } from '@/features/analytics/components/analytics-section-card';
import { AnalyticsStatCard } from '@/features/analytics/components/analytics-stat-card';
import { usePortalAnalyticsOverviewQuery } from '@/features/builder/hooks/use-portal-analytics';
import { ReadinessStatusBadge } from '@/features/readiness/components/readiness-status-badge';

const maxCount = (values: number[]): number => (values.length > 0 ? Math.max(...values) : 0);

/**
 * Builder portal analytics dashboard (company-scoped).
 */
export const BuilderAnalyticsPage = () => {
  const t = useTranslations('Builder.analytics');
  const tCommon = useTranslations('Analytics.common');
  const tCrm = useTranslations('Analytics.crmStatuses');
  const tSources = useTranslations('Analytics.requestSources');
  const tSales = useTranslations('Analytics.apartmentSales');
  const query = usePortalAnalyticsOverviewQuery();

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{tCommon('loading')}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {tCommon('error')}
      </p>
    );
  }

  const data = query.data;
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-page-title text-ink">{t('title')}</h1>
        <p className="text-sm text-ink-secondary">{t('subtitle')}</p>
      </div>

      <AnalyticsDateRangeFilter />

      <AnalyticsSectionCard
        title={t('sections.topProjects')}
        empty={data.topProjectsByViews.length === 0}
        emptyLabel={tCommon('empty')}
      >
        <AnalyticsEntityRankList
          items={data.topProjectsByViews}
          rankLabel={t('table.rank')}
          nameLabel={t('table.name')}
          viewsLabel={t('table.views')}
          emptyLabel={tCommon('empty')}
        />
      </AnalyticsSectionCard>

      <AnalyticsSectionCard
        title={t('sections.topApartments')}
        empty={data.topApartmentsByViews.length === 0}
        emptyLabel={tCommon('empty')}
      >
        <AnalyticsEntityRankList
          items={data.topApartmentsByViews}
          rankLabel={t('table.rank')}
          nameLabel={t('table.name')}
          viewsLabel={t('table.views')}
          emptyLabel={tCommon('empty')}
        />
      </AnalyticsSectionCard>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">{t('sections.favorites')}</h2>
        <AnalyticsStatCard label={t('favorites.total')} value={data.favorites.total} />
      </section>

      <AnalyticsSectionCard
        title={t('sections.topProjectsByFavorites')}
        empty={data.favorites.topProjects.length === 0}
        emptyLabel={tCommon('empty')}
      >
        <AnalyticsEntityRankList
          items={data.favorites.topProjects.map((item) => ({
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

      <AnalyticsSectionCard title={t('sections.requests')}>
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
        title={t('sections.dealsByStatus')}
        empty={data.dealsByStatus.length === 0}
        emptyLabel={tCommon('empty')}
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

      <AnalyticsSectionCard title={t('sections.apartmentSales')}>
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

      <AnalyticsSectionCard title={t('sections.readiness')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <ReadinessMetric
            title={t('readiness.company')}
            status={data.readiness.companyStatus}
            score={data.readiness.companyOverallScore}
            noDataLabel={tCommon('empty')}
          />
          <ReadinessMetric
            title={t('readiness.project')}
            status={data.readiness.projectStatus}
            score={data.readiness.projectOverallScore}
            noDataLabel={tCommon('empty')}
          />
        </div>
      </AnalyticsSectionCard>
    </div>
  );
};

type ReadinessMetricProps = {
  title: string;
  status: Parameters<typeof ReadinessStatusBadge>[0]['status'] | null;
  score: number | null;
  noDataLabel: string;
};

const ReadinessMetric = ({ title, status, score, noDataLabel }: ReadinessMetricProps) => {
  const t = useTranslations('Builder.readiness');

  return (
    <div className="rounded-sm border border-border bg-background p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{title}</p>
      {status ? (
        <div className="mt-3 flex flex-col gap-2">
          <ReadinessStatusBadge status={status} namespace="Builder.readiness" />
          <p className="text-sm text-ink-secondary">
            {t('overallScore')}: {score ?? '—'}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink-secondary">{noDataLabel}</p>
      )}
    </div>
  );
};
