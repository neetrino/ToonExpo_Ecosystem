import { AnalyticsBarTable, AnalyticsStatCards } from '@/components/analytics/analytics-widgets';
import type { BuilderAnalyticsSnapshot } from '@/lib/analytics/builder-queries';
import {
  labeledSharesFromBuilderReadiness,
  labeledSharesFromCounts,
  labeledSharesFromProjectViews,
} from '@/lib/analytics/label-rows';

type AnalyticsTranslate = {
  (key: string, values?: Record<string, string | number | Date>): string;
  has: (key: string) => boolean;
};

type BuilderAnalyticsViewProps = {
  t: AnalyticsTranslate;
  data: BuilderAnalyticsSnapshot;
};

export function BuilderAnalyticsView({ t, data }: BuilderAnalyticsViewProps) {
  const recentViews = data.projectViews.reduce((sum, row) => sum + row.lastPeriod, 0);

  return (
    <section className="analytics-page">
      <header>
        <h2 className="portal-page__title">{t('title')}</h2>
        <p className="analytics-page__subtitle">{t('subtitle', { days: data.lookbackDays })}</p>
      </header>

      <AnalyticsStatCards
        stats={[
          {
            key: 'recentViews',
            label: t('stats.projectViewsRecent'),
            value: String(recentViews),
          },
          {
            key: 'qrDeals',
            label: t('stats.qrScanDeals'),
            value: String(data.qrScanCreatedDealsCount),
          },
        ]}
      />

      <AnalyticsBarTable
        title={t('sections.projectViews')}
        emptyLabel={t('empty')}
        labelHeader={t('columns.label')}
        countHeader={t('columns.count')}
        rows={labeledSharesFromProjectViews(data.projectViews)}
      />
      <AnalyticsBarTable
        title={t('sections.dealsByStage')}
        emptyLabel={t('empty')}
        labelHeader={t('columns.label')}
        countHeader={t('columns.count')}
        rows={labeledSharesFromCounts(data.dealsByStage, t, 'stages')}
      />
      <AnalyticsBarTable
        title={t('sections.dealsBySource')}
        emptyLabel={t('empty')}
        labelHeader={t('columns.label')}
        countHeader={t('columns.count')}
        rows={labeledSharesFromCounts(data.dealsBySource, t, 'sources')}
      />
      <AnalyticsBarTable
        title={t('sections.readiness')}
        emptyLabel={t('empty')}
        labelHeader={t('columns.label')}
        countHeader={t('columns.count')}
        rows={labeledSharesFromBuilderReadiness(data.readiness, t('readinessCompany'))}
      />
    </section>
  );
}
