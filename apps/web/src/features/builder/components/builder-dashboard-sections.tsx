'use client';

import type { CrmDealListItem, PortalProjectListItem } from '@toonexpo/contracts';
import { Building2 } from 'lucide-react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

import { formatBuyerDateTime } from '@/features/buyer/utils/format-datetime';
import type { CrmDashboardStats } from '@/features/builder/utils/crm-dashboard-stats';
import { CRM_OPEN_DEAL_STATUSES } from '@/features/builder/utils/crm-status-transitions';
import { AnalyticsEntityRankList } from '@/features/analytics/components/analytics-entity-rank-list';
import { AnalyticsSectionCard } from '@/features/analytics/components/analytics-section-card';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { Link } from '@/i18n/navigation';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';

const PREVIEW_ITEM_LIMIT = 5;
const THUMB_PX = 40;

type ListThumbProps = {
  src?: string | null | undefined;
};

const ListThumb = ({ src }: ListThumbProps) => (
  <span
    className={cn(
      'relative inline-flex size-10 shrink-0 items-center justify-center',
      'overflow-hidden rounded-md bg-surface text-ink-muted',
    )}
  >
    {src ? (
      <Image
        src={src}
        alt=""
        width={THUMB_PX}
        height={THUMB_PX}
        className="size-full object-cover"
      />
    ) : (
      <Building2 className="size-4" aria-hidden />
    )}
  </span>
);

type RecentProjectsSectionProps = {
  projects: PortalProjectListItem[];
};

export const BuilderDashboardProjectsSection = ({ projects }: RecentProjectsSectionProps) => {
  const t = useTranslations('Builder.dashboard');
  const preview = projects.slice(0, PREVIEW_ITEM_LIMIT);

  return (
    <AnalyticsSectionCard
      title={t('sections.recentProjects')}
      empty={preview.length === 0}
      emptyLabel={t('empty.projects')}
      className="h-full"
      action={
        <Link href="/builder/projects" className="text-sm font-medium text-brand-secondary hover:underline">
          {t('viewAll')}
        </Link>
      }
    >
      <ul className="flex flex-col gap-2.5">
        {preview.map((project) => (
          <li
            key={project.id}
            className="flex items-center justify-between gap-3 border-b border-border/60 pb-2.5 last:border-0 last:pb-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <ListThumb />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{project.name}</p>
                <p className="truncate text-xs text-ink-secondary">
                  {t('projectMeta', {
                    buildings: project.buildingsCount,
                    apartments: project.apartmentsCount,
                  })}
                </p>
              </div>
            </div>
            <PublicationStatusBadge status={project.publicationStatus} />
          </li>
        ))}
      </ul>
    </AnalyticsSectionCard>
  );
};

type RecentDealsSectionProps = {
  deals: CrmDealListItem[];
};

export const BuilderDashboardDealsSection = ({ deals }: RecentDealsSectionProps) => {
  const t = useTranslations('Builder.dashboard');
  const tCrm = useTranslations('Builder.crm');
  const locale = useLocale();
  const preview = deals.slice(0, PREVIEW_ITEM_LIMIT);

  return (
    <AnalyticsSectionCard
      title={t('sections.recentDeals')}
      empty={preview.length === 0}
      emptyLabel={t('empty.deals')}
      className="h-full"
      action={
        <Link href="/builder/crm" className="text-sm font-medium text-brand-secondary hover:underline">
          {t('viewAll')}
        </Link>
      }
    >
      <ul className="flex flex-col gap-3">
        {preview.map((deal) => {
          const title = deal.buyer.name?.trim() || deal.projectName || t('dealFallback');
          return (
            <li
              key={deal.id}
              className="flex flex-col gap-1 border-b border-border/60 pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-3">
                  <ListThumb />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{title}</p>
                    <p className="truncate text-xs text-ink-secondary">
                      {deal.projectName ?? t('noProject')}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {formatBuyerDateTime(deal.updatedAt, locale)}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-medium text-ink-secondary">
                  {tCrm(`statuses.${deal.status}`)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </AnalyticsSectionCard>
  );
};

type PipelineSectionProps = {
  stats: CrmDashboardStats;
};

export const BuilderDashboardPipelineSection = ({ stats }: PipelineSectionProps) => {
  const t = useTranslations('Builder.dashboard');
  const tStatus = useTranslations('Builder.crm');
  const rows = CRM_OPEN_DEAL_STATUSES.filter((status) => stats.openByStatus[status] > 0);

  return (
    <AnalyticsSectionCard
      title={t('sections.crmPipeline')}
      empty={rows.length === 0}
      emptyLabel={t('empty.pipeline')}
      className="h-full"
      action={
        <Link href="/builder/crm" className="text-sm font-medium text-brand-secondary hover:underline">
          {t('crm.openCrm')}
        </Link>
      }
    >
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-muted">{t('crm.openTotal')}</p>
          <p className="mt-1 text-xl font-semibold text-ink">{stats.openTotal}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-muted">{t('crm.createdToday')}</p>
          <p className="mt-1 text-xl font-semibold text-ink">{stats.createdToday}</p>
        </div>
      </div>
      <ul className="flex flex-col gap-1.5">
        {rows.map((status) => (
          <li key={status} className="flex items-center justify-between gap-2 text-sm">
            <span className="truncate text-ink-secondary">{tStatus(`statuses.${status}`)}</span>
            <span className="font-medium tabular-nums text-ink">{stats.openByStatus[status]}</span>
          </li>
        ))}
      </ul>
    </AnalyticsSectionCard>
  );
};

type TopProjectsSectionProps = {
  items: {
    entityId: string;
    name: string | null;
    viewCount: number;
    coverUrl?: string | null;
  }[];
};

export const BuilderDashboardTopProjectsSection = ({ items }: TopProjectsSectionProps) => {
  const t = useTranslations('Builder.dashboard');
  const tAnalytics = useTranslations('Builder.analytics');
  const tCommon = useTranslations('Analytics.common');

  return (
    <AnalyticsSectionCard
      title={t('sections.topProjects')}
      empty={items.length === 0}
      emptyLabel={t('empty.topProjects')}
      className="h-full"
      action={
        <Link
          href="/builder/analytics"
          className="text-sm font-medium text-brand-secondary hover:underline"
        >
          {t('viewAll')}
        </Link>
      }
    >
      <AnalyticsEntityRankList
        items={items.slice(0, PREVIEW_ITEM_LIMIT)}
        rankLabel={tAnalytics('table.rank')}
        nameLabel={tAnalytics('table.name')}
        viewsLabel={tAnalytics('table.views')}
        emptyLabel={tCommon('empty')}
        showCovers
      />
    </AnalyticsSectionCard>
  );
};

type ShortcutsSectionProps = {
  onNewProject: () => void;
  requestsTotal: number | null;
  favoritesTotal: number | null;
};

export const BuilderDashboardShortcutsSection = ({
  onNewProject,
  requestsTotal,
  favoritesTotal,
}: ShortcutsSectionProps) => {
  const t = useTranslations('Builder.dashboard');

  return (
    <AnalyticsSectionCard
      title={t('sections.shortcuts')}
      titleClassName="text-base sm:text-lg"
      className="h-full"
      action={
        <Button type="button" size="sm" variant="secondary" onClick={onNewProject}>
          <AddActionLabel>{t('links.newProject')}</AddActionLabel>
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[12px] border border-border/70 bg-canvas/50 px-3 py-2.5">
            <p className="text-xs text-ink-muted">{t('stats.requests')}</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-ink">
              {requestsTotal ?? '—'}
            </p>
          </div>
          <div className="rounded-[12px] border border-border/70 bg-canvas/50 px-3 py-2.5">
            <p className="text-xs text-ink-muted">{t('stats.favorites')}</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-ink">
              {favoritesTotal ?? '—'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { href: '/builder/projects' as const, label: t('quickLinks.projects') },
              { href: '/builder/crm' as const, label: t('quickLinks.crm') },
              { href: '/builder/team' as const, label: t('quickLinks.team') },
              { href: '/builder/scanner' as const, label: t('quickLinks.scanner') },
              { href: '/builder/readiness' as const, label: t('quickLinks.readiness') },
              { href: '/builder/analytics' as const, label: t('quickLinks.analytics') },
            ] as const
          ).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[12px] border border-border/70 bg-surface px-3 py-2.5 text-center text-sm font-medium text-ink transition-colors hover:bg-canvas"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </AnalyticsSectionCard>
  );
};
