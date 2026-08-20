'use client';

import {
  Briefcase,
  Building2,
  FolderKanban,
  LayoutDashboard,
  Layers,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  AnalyticsKpiCard,
  type AnalyticsKpiTone,
} from '@/features/analytics/components/analytics-kpi-card';
import { CreateProjectSheet } from '@/features/builder/components/create-project-sheet';
import {
  BuilderDashboardDealsSection,
  BuilderDashboardPipelineSection,
  BuilderDashboardProjectsSection,
  BuilderDashboardShortcutsSection,
  BuilderDashboardTopProjectsSection,
} from '@/features/builder/components/builder-dashboard-sections';
import { PORTAL_MAX_PAGE_SIZE } from '@/features/builder/constants';
import {
  toCatalogPublicationStatus,
  type CatalogPublicationStatus,
} from '@/features/catalog/utils/catalog-publication-status';
import { usePortalAnalyticsOverviewQuery } from '@/features/builder/hooks/use-portal-analytics';
import { useCrmDealsQuery } from '@/features/builder/hooks/use-portal-crm';
import { usePortalProjectsQuery } from '@/features/builder/hooks/use-portal-projects';
import { aggregateCrmDashboardStats } from '@/features/builder/utils/crm-dashboard-stats';
import { Link } from '@/i18n/navigation';
import {
  LIST_CARD_STAGGER_MS,
  LIST_CONTENT_BASE_DELAY_MS,
  StaggerGroup,
} from '@/shared/ui/motion';
import { PageTitleBlock } from '@/shared/ui/page-title-icon';
import { Skeleton } from '@/shared/ui/skeleton';

const SECTION_BASE_DELAY_MS = 220;

type StatusCounts = Record<CatalogPublicationStatus, number>;

const emptyCounts = (): StatusCounts => ({
  draft: 0,
  published: 0,
});

type KpiItem = {
  key: string;
  href: '/builder/projects' | '/builder/crm';
  label: string;
  value: number;
  icon: LucideIcon;
  tone: AnalyticsKpiTone;
  trendLabel: string;
};

/**
 * Builder dashboard — admin/account analytics layout with live portal data.
 */
export const BuilderDashboardPage = () => {
  const t = useTranslations('Builder.dashboard');
  const projectsQuery = usePortalProjectsQuery(1, PORTAL_MAX_PAGE_SIZE);
  const dealsQuery = useCrmDealsQuery({ page: 1, pageSize: PORTAL_MAX_PAGE_SIZE });
  const analyticsQuery = usePortalAnalyticsOverviewQuery();
  const [createOpen, setCreateOpen] = useState(false);

  const isLoading = projectsQuery.isLoading || dealsQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <PageTitleBlock title={t('title')} subtitle={t('subtitle')} icon={LayoutDashboard} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (projectsQuery.isError || !projectsQuery.data || dealsQuery.isError || !dealsQuery.data) {
    return (
      <div className="flex flex-col gap-6">
        <PageTitleBlock title={t('title')} subtitle={t('subtitle')} icon={LayoutDashboard} />
        <p role="alert" className="text-sm text-danger">
          {t('error')}
        </p>
      </div>
    );
  }

  const projects = projectsQuery.data.data;
  const deals = dealsQuery.data.data;
  const statusCounts = projects.reduce<StatusCounts>((acc, project) => {
    acc[toCatalogPublicationStatus(project.publicationStatus)] += 1;
    return acc;
  }, emptyCounts());
  const apartmentsTotal = projects.reduce((sum, project) => sum + project.apartmentsCount, 0);
  const crmStats = aggregateCrmDashboardStats(deals);
  const analytics = analyticsQuery.data;

  const kpis: KpiItem[] = [
    {
      key: 'projects',
      href: '/builder/projects',
      label: t('stats.projects'),
      value: projectsQuery.data.meta.total,
      icon: FolderKanban,
      tone: 'teal',
      trendLabel: t('hints.projects'),
    },
    {
      key: 'published',
      href: '/builder/projects',
      label: t('stats.published'),
      value: statusCounts.published,
      icon: Building2,
      tone: 'green',
      trendLabel: t('hints.published'),
    },
    {
      key: 'deals',
      href: '/builder/crm',
      label: t('stats.openDeals'),
      value: crmStats.openTotal,
      icon: Briefcase,
      tone: 'accent',
      trendLabel: t('hints.openDeals', { count: crmStats.createdToday }),
    },
    {
      key: 'apartments',
      href: '/builder/projects',
      label: t('stats.apartments'),
      value: apartmentsTotal,
      icon: Layers,
      tone: 'blue',
      trendLabel: t('hints.apartments'),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageTitleBlock title={t('title')} subtitle={t('subtitle')} icon={LayoutDashboard} />

      <StaggerGroup
        force
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 [&>*]:h-full [&>*]:min-w-0"
        staggerMs={LIST_CARD_STAGGER_MS}
        baseDelayMs={LIST_CONTENT_BASE_DELAY_MS}
        durationMs={520}
      >
        {kpis.map((item) => (
          <Link key={item.key} href={item.href} className="block h-full min-w-0">
            <AnalyticsKpiCard
              label={item.label}
              value={item.value}
              icon={item.icon}
              tone={item.tone}
              changePercent={null}
              trendLabel={item.trendLabel}
              className="h-full"
            />
          </Link>
        ))}
      </StaggerGroup>

      <StaggerGroup
        force
        className="grid grid-cols-1 gap-4 xl:grid-cols-2 [&>*]:h-full [&>*]:min-w-0"
        staggerMs={90}
        baseDelayMs={SECTION_BASE_DELAY_MS}
        durationMs={560}
      >
        <BuilderDashboardProjectsSection projects={projects} />
        <BuilderDashboardDealsSection deals={deals} />
      </StaggerGroup>

      <StaggerGroup
        force
        className="grid grid-cols-1 gap-4 xl:grid-cols-2 [&>*]:h-full [&>*]:min-w-0"
        staggerMs={90}
        baseDelayMs={SECTION_BASE_DELAY_MS + 120}
        durationMs={560}
      >
        <BuilderDashboardPipelineSection stats={crmStats} />
        <BuilderDashboardTopProjectsSection items={analytics?.topProjectsByViews ?? []} />
      </StaggerGroup>

      <StaggerGroup
        force
        className="grid grid-cols-1 gap-4 [&>*]:min-w-0"
        staggerMs={90}
        baseDelayMs={SECTION_BASE_DELAY_MS + 240}
        durationMs={560}
      >
        <BuilderDashboardShortcutsSection
          onNewProject={() => {
            setCreateOpen(true);
          }}
          requestsTotal={analytics?.requests.total ?? null}
          favoritesTotal={analytics?.favorites.total ?? null}
        />
      </StaggerGroup>

      <CreateProjectSheet
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
        }}
      />
    </div>
  );
};
