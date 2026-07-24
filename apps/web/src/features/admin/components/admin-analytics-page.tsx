'use client';

import type { CrmDealStatus, ReadinessScoreStatus, RequestSource } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { AnalyticsBarRow } from '@/features/analytics/components/analytics-bar-row';
import { AnalyticsDateRangeFilter } from '@/features/analytics/components/analytics-date-range-filter';
import { AnalyticsEntityRankList } from '@/features/analytics/components/analytics-entity-rank-list';
import { AnalyticsSectionCard } from '@/features/analytics/components/analytics-section-card';
import { AnalyticsStatCard } from '@/features/analytics/components/analytics-stat-card';
import { useAdminAnalyticsOverviewQuery } from '@/features/admin/hooks/use-admin-analytics';
import { ReadinessStatusBadge } from '@/features/readiness/components/readiness-status-badge';
import { READINESS_SCORE_MAX } from '@/features/readiness/constants';

const maxCount = (values: number[]): number => (values.length > 0 ? Math.max(...values) : 0);

/**
 * Platform admin analytics dashboard.
 */
export const AdminAnalyticsPage = () => {
  const t = useTranslations('Admin.analytics');
  const tCommon = useTranslations('Analytics.common');
  const tCrm = useTranslations('Analytics.crmStatuses');
  const tSources = useTranslations('Analytics.requestSources');
  const tReadiness = useTranslations('Admin.readiness');
  const query = useAdminAnalyticsOverviewQuery();

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
  const qrMax = maxCount(data.qrScansByContext.map((item) => item.count));
  const readinessMax = maxCount(data.readiness.assessmentsByStatus.map((item) => item.count));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-page-title text-ink">{t('title')}</h1>
        <p className="text-sm text-ink-secondary">{t('subtitle')}</p>
      </div>

      <AnalyticsDateRangeFilter />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink">{t('sections.platformActivity')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnalyticsStatCard
            label={t('platformActivity.totalUsers')}
            value={data.platformActivity.totalUsers}
          />
          <AnalyticsStatCard
            label={t('platformActivity.registeredBuyers')}
            value={data.platformActivity.registeredBuyers}
          />
          <AnalyticsStatCard
            label={t('platformActivity.activeBuilderCompanies')}
            value={data.platformActivity.activeBuilderCompanies}
          />
          <AnalyticsStatCard
            label={t('platformActivity.activePartners')}
            value={data.platformActivity.activePartners}
          />
          <AnalyticsStatCard
            label={t('platformActivity.publishedProjects')}
            value={data.platformActivity.publishedProjects}
          />
          <AnalyticsStatCard
            label={t('platformActivity.publishedApartments')}
            value={data.platformActivity.publishedApartments}
          />
        </div>
      </section>

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

      <AnalyticsSectionCard
        title={t('sections.qrScans')}
        empty={data.qrScansByContext.length === 0}
        emptyLabel={tCommon('empty')}
      >
        <div className="flex flex-col gap-3">
          {data.qrScansByContext.map((item) => (
            <AnalyticsBarRow
              key={item.context}
              label={item.context}
              value={item.count}
              max={qrMax}
            />
          ))}
        </div>
      </AnalyticsSectionCard>

      <AnalyticsSectionCard title={t('sections.checkIns')}>
        <div className="grid gap-3 sm:grid-cols-3">
          <AnalyticsStatCard
            label={t('checkIns.allowed')}
            value={data.checkIns.allowed}
            className="bg-surface-elevated"
          />
          <AnalyticsStatCard
            label={t('checkIns.duplicate')}
            value={data.checkIns.duplicate}
            className="bg-surface-elevated"
          />
          <AnalyticsStatCard
            label={t('checkIns.denied')}
            value={data.checkIns.denied}
            className="bg-surface-elevated"
          />
        </div>
      </AnalyticsSectionCard>

      <AnalyticsSectionCard title={t('sections.readiness')}>
        <div className="flex flex-col gap-6">
          {data.readiness.assessmentsByStatus.length === 0 ? (
            <p className="text-sm text-ink-secondary">{tCommon('empty')}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.readiness.assessmentsByStatus.map((item) => (
                <div key={item.status} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <ReadinessStatusBadge
                      status={item.status as ReadinessScoreStatus}
                      namespace="Admin.readiness"
                    />
                    <span className="text-sm font-medium text-ink">{item.count}</span>
                  </div>
                  <AnalyticsBarRow
                    label={tReadiness(`statuses.${item.status}`)}
                    value={item.count}
                    max={readinessMax}
                    valueLabel=""
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              {t('readiness.weakestCategories')}
            </h3>
            {data.readiness.weakestCategories.length === 0 ? (
              <p className="text-sm text-ink-secondary">{tCommon('empty')}</p>
            ) : (
              data.readiness.weakestCategories.map((item) => (
                <AnalyticsBarRow
                  key={item.categoryId}
                  label={item.categoryName}
                  value={item.averageScore}
                  max={READINESS_SCORE_MAX}
                  valueLabel={String(item.averageScore)}
                />
              ))
            )}
          </div>
        </div>
      </AnalyticsSectionCard>
    </div>
  );
};
