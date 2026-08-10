'use client';

import type {
  AdminAnalyticsOverview,
  AnalyticsTrendMetric,
} from '@toonexpo/contracts';
import {
  Building2,
  FolderKanban,
  HardHat,
  Handshake,
  LineChart,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { AdminAnalyticsSecondarySections } from '@/features/admin/components/admin-analytics-secondary-sections';
import { useAdminAnalyticsOverviewQuery } from '@/features/admin/hooks/use-admin-analytics';
import { AnalyticsActivityChart } from '@/features/analytics/components/analytics-activity-chart';
import { AnalyticsDateRangeFilter } from '@/features/analytics/components/analytics-date-range-filter';
import { AnalyticsEntityRankList } from '@/features/analytics/components/analytics-entity-rank-list';
import {
  AnalyticsKpiCard,
  type AnalyticsKpiTone,
} from '@/features/analytics/components/analytics-kpi-card';
import { AnalyticsSectionCard } from '@/features/analytics/components/analytics-section-card';
import {
  ANALYTICS_DEFAULT_PRESET,
  ANALYTICS_RANGE_PRESETS,
  type AnalyticsRangePreset,
} from '@/features/analytics/constants';
import { Link } from '@/i18n/navigation';
import { Reveal, StaggerGroup } from '@/shared/ui/motion';
import { PageTitleBlock } from '@/shared/ui/page-title-icon';

const TOP_PROJECTS_DISPLAY_LIMIT = 5;
const KPI_STAGGER_MS = 70;
const SECTION_STAGGER_MS = 90;
const SECTION_BASE_DELAY_MS = 280;

type KpiConfig = {
  key: keyof AdminAnalyticsOverview['platformActivity'];
  labelKey:
    | 'totalUsers'
    | 'registeredBuyers'
    | 'activeBuilderCompanies'
    | 'activePartners'
    | 'publishedProjects'
    | 'publishedApartments';
  icon: LucideIcon;
  tone: AnalyticsKpiTone;
};

const KPI_CONFIG: KpiConfig[] = [
  { key: 'totalUsers', labelKey: 'totalUsers', icon: Users, tone: 'teal' },
  { key: 'registeredBuyers', labelKey: 'registeredBuyers', icon: UserPlus, tone: 'accent' },
  {
    key: 'activeBuilderCompanies',
    labelKey: 'activeBuilderCompanies',
    icon: HardHat,
    tone: 'blue',
  },
  { key: 'activePartners', labelKey: 'activePartners', icon: Handshake, tone: 'orange' },
  {
    key: 'publishedProjects',
    labelKey: 'publishedProjects',
    icon: FolderKanban,
    tone: 'sky',
  },
  {
    key: 'publishedApartments',
    labelKey: 'publishedApartments',
    icon: Building2,
    tone: 'green',
  },
];

const isAnalyticsRangePreset = (value: string | null): value is AnalyticsRangePreset =>
  value !== null && (ANALYTICS_RANGE_PRESETS as readonly string[]).includes(value);

const formatSignedCount = (value: number): string =>
  value > 0 ? `+${value}` : String(value);

const trendToneClass = (changePercent: number | null): string => {
  if (changePercent == null || changePercent === 0) {
    return 'text-ink-muted';
  }
  return changePercent > 0 ? 'text-success' : 'text-danger';
};

const formatTrendPercent = (changePercent: number | null): string => {
  if (changePercent == null) {
    return '—';
  }
  const arrow = changePercent > 0 ? '↑' : changePercent < 0 ? '↓' : '—';
  const abs = Math.abs(changePercent).toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });
  return `${arrow} ${abs}%`;
};

/**
 * Platform admin analytics dashboard.
 */
export const AdminAnalyticsPage = () => {
  const t = useTranslations('Admin.analytics');
  const tCommon = useTranslations('Analytics.common');
  const query = useAdminAnalyticsOverviewQuery();

  return (
    <div className="flex flex-col gap-6">
      <Reveal force>
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <PageTitleBlock title={t('title')} subtitle={t('subtitle')} icon={LineChart} />
          <AnalyticsDateRangeFilter variant="toolbar" />
        </div>
      </Reveal>

      {query.isLoading ? (
        <p className="text-sm text-ink-secondary">{tCommon('loading')}</p>
      ) : query.isError || !query.data ? (
        <p role="alert" className="text-sm text-danger">
          {tCommon('error')}
        </p>
      ) : (
        <AdminAnalyticsContent data={query.data} />
      )}
    </div>
  );
};

type AdminAnalyticsContentProps = {
  data: AdminAnalyticsOverview;
};

const AdminAnalyticsContent = ({ data }: AdminAnalyticsContentProps) => {
  const t = useTranslations('Admin.analytics');
  const tCommon = useTranslations('Analytics.common');
  const tDate = useTranslations('Analytics.dateRange');
  const searchParams = useSearchParams();
  const presetParam = searchParams.get('preset');
  const preset = isAnalyticsRangePreset(presetParam)
    ? presetParam
    : ANALYTICS_DEFAULT_PRESET;

  return (
    <div className="flex flex-col gap-6">
      <StaggerGroup
        force
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 [&>*]:h-full [&>*]:min-w-0"
        staggerMs={KPI_STAGGER_MS}
        baseDelayMs={80}
        durationMs={520}
      >
        {KPI_CONFIG.map((item) => {
          const metric = data.platformActivity[item.key];
          return (
            <AnalyticsKpiCard
              key={item.key}
              label={t(`platformActivity.${item.labelKey}`)}
              value={metric.value}
              icon={item.icon}
              tone={item.tone}
              changePercent={metric.changePercent}
              trendLabel={t(`trend.${preset}`)}
              className="h-full"
            />
          );
        })}
      </StaggerGroup>

      <StaggerGroup
        force
        className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)] [&>*]:h-full [&>*]:min-w-0"
        staggerMs={SECTION_STAGGER_MS}
        baseDelayMs={SECTION_BASE_DELAY_MS}
        durationMs={560}
      >
        <AnalyticsSectionCard
          title={t('sections.platformActivity')}
          className="h-full"
          action={
            <span className="rounded-pill bg-surface px-3 py-1 text-xs font-medium text-ink-secondary ring-1 ring-border">
              {tDate(preset)}
            </span>
          }
        >
          <AnalyticsActivityChart
            points={data.activitySeries}
            usersLabel={t('chart.users')}
            projectsLabel={t('chart.projects')}
          />
          <div className="grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-3">
            <GrowthStat
              label={t('growth.newUsers')}
              metric={data.activityGrowth.newUsers}
            />
            <GrowthStat
              label={t('growth.newProjects')}
              metric={data.activityGrowth.newProjects}
            />
            <GrowthStat
              label={t('growth.newApartments')}
              metric={data.activityGrowth.newApartments}
            />
          </div>
        </AnalyticsSectionCard>

        <AnalyticsSectionCard
          title={t('sections.topProjects')}
          empty={data.topProjectsByViews.length === 0}
          emptyLabel={tCommon('empty')}
          className="h-full"
          action={
            <Link
              href="/admin/projects"
              className="text-sm font-medium text-brand-secondary hover:underline"
            >
              {t('viewAll')}
            </Link>
          }
        >
          <AnalyticsEntityRankList
            items={data.topProjectsByViews.slice(0, TOP_PROJECTS_DISPLAY_LIMIT)}
            rankLabel={t('table.rank')}
            nameLabel={t('table.name')}
            viewsLabel={t('table.views')}
            emptyLabel={tCommon('empty')}
            showCovers
          />
        </AnalyticsSectionCard>
      </StaggerGroup>

      <AdminAnalyticsSecondarySections data={data} />
    </div>
  );
};

type GrowthStatProps = {
  label: string;
  metric: AnalyticsTrendMetric;
};

const GrowthStat = ({ label, metric }: GrowthStatProps) => (
  <div className="flex flex-col gap-1">
    <p className="text-sm font-semibold text-ink">
      {formatSignedCount(metric.value)} {label}
    </p>
    <p className={`text-xs font-medium ${trendToneClass(metric.changePercent)}`}>
      {formatTrendPercent(metric.changePercent)}
    </p>
  </div>
);
