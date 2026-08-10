'use client';

import type { PortalAnalyticsOverview } from '@toonexpo/contracts';
import {
  Briefcase,
  Building2,
  Heart,
  Inbox,
  LineChart,
  type LucideIcon,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

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
import { BuilderAnalyticsSecondarySections } from '@/features/builder/components/builder-analytics-secondary-sections';
import { usePortalAnalyticsOverviewQuery } from '@/features/builder/hooks/use-portal-analytics';
import { Link } from '@/i18n/navigation';
import { Reveal, StaggerGroup } from '@/shared/ui/motion';
import { PageTitleBlock } from '@/shared/ui/page-title-icon';
import { Skeleton } from '@/shared/ui/skeleton';

const TOP_ENTITIES_DISPLAY_LIMIT = 5;
const KPI_STAGGER_MS = 70;
const SECTION_STAGGER_MS = 90;
const SECTION_BASE_DELAY_MS = 280;

type KpiItem = {
  key: string;
  labelKey:
    | 'requests'
    | 'favorites'
    | 'deals'
    | 'available'
    | 'reserved'
    | 'sold';
  value: number;
  icon: LucideIcon;
  tone: AnalyticsKpiTone;
};

const isAnalyticsRangePreset = (value: string | null): value is AnalyticsRangePreset =>
  value !== null && (ANALYTICS_RANGE_PRESETS as readonly string[]).includes(value);

const sumDealCounts = (data: PortalAnalyticsOverview): number =>
  data.dealsByStatus.reduce((sum, item) => sum + item.count, 0);

/**
 * Builder portal analytics — same layout language as admin analytics.
 */
export const BuilderAnalyticsPage = () => {
  const t = useTranslations('Builder.analytics');
  const tCommon = useTranslations('Analytics.common');
  const query = usePortalAnalyticsOverviewQuery();

  return (
    <div className="flex flex-col gap-6">
      <Reveal force>
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <PageTitleBlock title={t('title')} subtitle={t('subtitle')} icon={LineChart} />
          <AnalyticsDateRangeFilter variant="toolbar" />
        </div>
      </Reveal>

      {query.isLoading ? (
        <div className="flex flex-col gap-6" aria-busy="true">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-28 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        </div>
      ) : query.isError || !query.data ? (
        <p role="alert" className="text-sm text-danger">
          {tCommon('error')}
        </p>
      ) : (
        <BuilderAnalyticsContent data={query.data} />
      )}
    </div>
  );
};

type BuilderAnalyticsContentProps = {
  data: PortalAnalyticsOverview;
};

const BuilderAnalyticsContent = ({ data }: BuilderAnalyticsContentProps) => {
  const t = useTranslations('Builder.analytics');
  const tCommon = useTranslations('Analytics.common');
  const tDate = useTranslations('Analytics.dateRange');
  const searchParams = useSearchParams();
  const presetParam = searchParams.get('preset');
  const preset = isAnalyticsRangePreset(presetParam)
    ? presetParam
    : ANALYTICS_DEFAULT_PRESET;

  const kpis: KpiItem[] = [
    {
      key: 'requests',
      labelKey: 'requests',
      value: data.requests.total,
      icon: Inbox,
      tone: 'teal',
    },
    {
      key: 'favorites',
      labelKey: 'favorites',
      value: data.favorites.total,
      icon: Heart,
      tone: 'accent',
    },
    {
      key: 'deals',
      labelKey: 'deals',
      value: sumDealCounts(data),
      icon: Briefcase,
      tone: 'blue',
    },
    {
      key: 'available',
      labelKey: 'available',
      value: data.apartmentSalesStatus.available,
      icon: Building2,
      tone: 'green',
    },
    {
      key: 'reserved',
      labelKey: 'reserved',
      value: data.apartmentSalesStatus.reserved,
      icon: Building2,
      tone: 'orange',
    },
    {
      key: 'sold',
      labelKey: 'sold',
      value: data.apartmentSalesStatus.sold,
      icon: Building2,
      tone: 'sky',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <StaggerGroup
        force
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 [&>*]:h-full [&>*]:min-w-0"
        staggerMs={KPI_STAGGER_MS}
        baseDelayMs={80}
        durationMs={520}
      >
        {kpis.map((item) => (
          <AnalyticsKpiCard
            key={item.key}
            label={t(`kpis.${item.labelKey}`)}
            value={item.value}
            icon={item.icon}
            tone={item.tone}
            changePercent={null}
            trendLabel={t(`trend.${preset}`)}
            className="h-full"
          />
        ))}
      </StaggerGroup>

      <StaggerGroup
        force
        className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)] [&>*]:h-full [&>*]:min-w-0"
        staggerMs={SECTION_STAGGER_MS}
        baseDelayMs={SECTION_BASE_DELAY_MS}
        durationMs={560}
      >
        <AnalyticsSectionCard
          title={t('sections.topProjects')}
          empty={data.topProjectsByViews.length === 0}
          emptyLabel={tCommon('empty')}
          className="h-full"
          action={
            <div className="flex items-center gap-3">
              <span className="rounded-pill bg-surface px-3 py-1 text-xs font-medium text-ink-secondary ring-1 ring-border">
                {tDate(preset)}
              </span>
              <Link
                href="/builder/projects"
                className="text-sm font-medium text-brand-secondary hover:underline"
              >
                {t('viewAll')}
              </Link>
            </div>
          }
        >
          <AnalyticsEntityRankList
            items={data.topProjectsByViews.slice(0, TOP_ENTITIES_DISPLAY_LIMIT)}
            rankLabel={t('table.rank')}
            nameLabel={t('table.name')}
            viewsLabel={t('table.views')}
            emptyLabel={tCommon('empty')}
            showCovers
          />
        </AnalyticsSectionCard>

        <AnalyticsSectionCard
          title={t('sections.topApartments')}
          empty={data.topApartmentsByViews.length === 0}
          emptyLabel={tCommon('empty')}
          className="h-full"
          action={
            <Link
              href="/builder/projects"
              className="text-sm font-medium text-brand-secondary hover:underline"
            >
              {t('viewAll')}
            </Link>
          }
        >
          <AnalyticsEntityRankList
            items={data.topApartmentsByViews.slice(0, TOP_ENTITIES_DISPLAY_LIMIT)}
            rankLabel={t('table.rank')}
            nameLabel={t('table.name')}
            viewsLabel={t('table.views')}
            emptyLabel={tCommon('empty')}
            showCovers
          />
        </AnalyticsSectionCard>
      </StaggerGroup>

      <BuilderAnalyticsSecondarySections data={data} />
    </div>
  );
};
