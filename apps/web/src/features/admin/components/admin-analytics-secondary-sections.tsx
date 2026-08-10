'use client';

import type {
  AdminAnalyticsOverview,
  CrmDealStatus,
  ReadinessScoreStatus,
  RequestSource,
} from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { AnalyticsBarRow } from '@/features/analytics/components/analytics-bar-row';
import { AnalyticsEntityRankList } from '@/features/analytics/components/analytics-entity-rank-list';
import { AnalyticsSectionCard } from '@/features/analytics/components/analytics-section-card';
import { AnalyticsStatCard } from '@/features/analytics/components/analytics-stat-card';
import { ReadinessStatusBadge } from '@/features/readiness/components/readiness-status-badge';
import { READINESS_SCORE_MAX } from '@/features/readiness/constants';

const maxCount = (values: number[]): number => (values.length > 0 ? Math.max(...values) : 0);

type AdminAnalyticsSecondarySectionsProps = {
  data: AdminAnalyticsOverview;
};

/**
 * Secondary admin analytics blocks below the primary dashboard.
 */
export const AdminAnalyticsSecondarySections = ({
  data,
}: AdminAnalyticsSecondarySectionsProps) => {
  const t = useTranslations('Admin.analytics');
  const tCommon = useTranslations('Analytics.common');
  const tCrm = useTranslations('Analytics.crmStatuses');
  const tSources = useTranslations('Analytics.requestSources');
  const tReadiness = useTranslations('Admin.readiness');
  const requestMax = maxCount([
    data.requests.total,
    ...data.requests.bySource.map((item) => item.count),
  ]);
  const dealMax = maxCount(data.dealsByStatus.map((item) => item.count));
  const qrMax = maxCount(data.qrScansByContext.map((item) => item.count));
  const readinessMax = maxCount(
    data.readiness.assessmentsByStatus.map((item) => item.count),
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <AnalyticsSectionCard title={t('sections.favorites')}>
        <AnalyticsStatCard
          label={t('favorites.total')}
          value={data.favorites.total}
          className="bg-surface-elevated"
        />
      </AnalyticsSectionCard>

      <AnalyticsSectionCard
        title={t('sections.topProjectsByFavorites')}
        empty={data.favorites.topProjects.length === 0}
        emptyLabel={tCommon('empty')}
        className="h-full"
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

      <AnalyticsSectionCard title={t('sections.requests')} className="h-full">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-muted">
              {t('requests.total')}
            </p>
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

      <AnalyticsSectionCard
        title={t('sections.qrScans')}
        empty={data.qrScansByContext.length === 0}
        emptyLabel={tCommon('empty')}
        className="h-full"
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

      <AnalyticsSectionCard title={t('sections.checkIns')} className="h-full">
        <div className="grid gap-3 sm:grid-cols-3">
          <AnalyticsStatCard
            label={t('checkIns.allowed')}
            value={data.checkIns.allowed}
            className="border-success/20 bg-success-soft shadow-none [&_p]:text-success"
          />
          <AnalyticsStatCard
            label={t('checkIns.duplicate')}
            value={data.checkIns.duplicate}
            className="border-warning/20 bg-warning-soft shadow-none [&_p]:text-warning"
          />
          <AnalyticsStatCard
            label={t('checkIns.denied')}
            value={data.checkIns.denied}
            className="border-danger/20 bg-danger-soft shadow-none [&_p]:text-danger"
          />
        </div>
      </AnalyticsSectionCard>

      <AnalyticsSectionCard
        title={t('sections.readiness')}
        className="h-full lg:col-span-2"
      >
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
