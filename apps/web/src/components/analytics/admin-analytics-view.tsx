import { AnalyticsBarTable, AnalyticsStatCards } from '@/components/analytics/analytics-widgets';
import type { AdminAnalyticsSnapshot } from '@/lib/analytics/admin-queries';
import {
  labeledSharesFromCounts,
  labeledSharesFromEvents,
  labeledSharesFromReadinessAverages,
} from '@/lib/analytics/label-rows';

type AnalyticsTranslate = {
  (key: string, values?: Record<string, string | number | Date>): string;
  has: (key: string) => boolean;
};

type AdminAnalyticsViewProps = {
  t: AnalyticsTranslate;
  data: AdminAnalyticsSnapshot;
};

export function AdminAnalyticsView({ t, data }: AdminAnalyticsViewProps) {
  return (
    <section className="analytics-page">
      <header>
        <h2 className="portal-page__title">{t('title')}</h2>
        <p className="analytics-page__subtitle">{t('subtitle', { days: data.lookbackDays })}</p>
        <nav className="portal-nav" aria-label={t('exports.ariaLabel')}>
          <a className="portal-nav__link" href="/nest/admin/reports/deals">
            {t('exports.deals')}
          </a>
          <a className="portal-nav__link" href="/nest/admin/reports/checkins">
            {t('exports.checkins')}
          </a>
          <a className="portal-nav__link" href="/nest/admin/reports/project-views">
            {t('exports.projectViews')}
          </a>
          <a className="portal-nav__link" href="/nest/admin/reports/audit">
            {t('exports.audit')}
          </a>
        </nav>
      </header>

      <AnalyticsStatCards
        stats={[
          {
            key: 'viewsTotal',
            label: t('stats.projectViewsTotal'),
            value: String(data.projectViewsTotal),
          },
          {
            key: 'viewsRecent',
            label: t('stats.projectViewsRecent'),
            value: String(data.projectViewsLastPeriod),
          },
          {
            key: 'apartmentViewsTotal',
            label: t('stats.apartmentViewsTotal'),
            value: String(data.apartmentViewsTotal),
          },
          {
            key: 'apartmentViewsRecent',
            label: t('stats.apartmentViewsRecent'),
            value: String(data.apartmentViewsLastPeriod),
          },
          {
            key: 'boothSelected',
            label: t('stats.boothSelectedTotal'),
            value: String(data.boothSelectedTotal),
          },
          {
            key: 'routeRequested',
            label: t('stats.routeRequestedTotal'),
            value: String(data.routeRequestedTotal),
          },
        ]}
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
        title={t('sections.dealsBySourceRecent')}
        emptyLabel={t('empty')}
        labelHeader={t('columns.label')}
        countHeader={t('columns.count')}
        rows={labeledSharesFromCounts(data.dealsBySourceLastPeriod, t, 'sources')}
      />
      <AnalyticsBarTable
        title={t('sections.qrScans')}
        emptyLabel={t('empty')}
        labelHeader={t('columns.label')}
        countHeader={t('columns.count')}
        rows={labeledSharesFromCounts(data.qrScansByPurpose, t, 'qrPurposes')}
      />
      <AnalyticsBarTable
        title={t('sections.checkIns')}
        emptyLabel={t('empty')}
        labelHeader={t('columns.label')}
        countHeader={t('columns.count')}
        rows={labeledSharesFromEvents(data.checkInsByEvent)}
      />
      <AnalyticsBarTable
        title={t('sections.projectsByStatus')}
        emptyLabel={t('empty')}
        labelHeader={t('columns.label')}
        countHeader={t('columns.count')}
        rows={labeledSharesFromCounts(data.projectsByStatus, t, 'publicationStatuses')}
      />
      <AnalyticsBarTable
        title={t('sections.apartmentsByStatus')}
        emptyLabel={t('empty')}
        labelHeader={t('columns.label')}
        countHeader={t('columns.count')}
        rows={labeledSharesFromCounts(data.apartmentsByStatus, t, 'apartmentStatuses')}
      />
      <AnalyticsBarTable
        title={t('sections.readiness')}
        emptyLabel={t('empty')}
        labelHeader={t('columns.label')}
        countHeader={t('columns.count')}
        rows={labeledSharesFromReadinessAverages(data.readinessAvgByCompany)}
      />
      <AnalyticsBarTable
        title={t('sections.partnersByType')}
        emptyLabel={t('empty')}
        labelHeader={t('columns.label')}
        countHeader={t('columns.count')}
        rows={labeledSharesFromCounts(data.partnersByType, t, 'partnerTypes')}
      />
    </section>
  );
}
