'use client';

import { LayoutDashboard } from 'lucide-react';
import type { PublicationStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { CreateProjectSheet } from '@/features/builder/components/create-project-sheet';
import { CrmDashboardWidget } from '@/features/builder/components/crm-dashboard-widget';
import { PORTAL_MAX_PAGE_SIZE } from '@/features/builder/constants';
import { usePortalProjectsQuery } from '@/features/builder/hooks/use-portal-projects';
import { Link } from '@/i18n/navigation';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { PageTitleBlock } from '@/shared/ui/page-title-icon';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

type StatusCounts = Record<PublicationStatus, number>;

const emptyCounts = (): StatusCounts => ({
  draft: 0,
  published: 0,
  archived: 0,
});

/**
 * Builder dashboard: project/apartment summary and quick links.
 */
export const BuilderDashboardPage = () => {
  const t = useTranslations('Builder.dashboard');
  const query = usePortalProjectsQuery(1, PORTAL_MAX_PAGE_SIZE);
  const [createOpen, setCreateOpen] = useState(false);

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const projects = query.data.data;
  const statusCounts = projects.reduce<StatusCounts>((acc, project) => {
    acc[project.publicationStatus] += 1;
    return acc;
  }, emptyCounts());
  const apartmentsTotal = projects.reduce((sum, project) => sum + project.apartmentsCount, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageTitleBlock title={t('title')} subtitle={t('subtitle')} icon={LayoutDashboard} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 sm:p-5">
          <p className="text-xs uppercase tracking-wide text-ink-muted">{t('stats.projects')}</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{query.data.meta.total}</p>
        </Card>
        <Card className="p-4 sm:p-5">
          <p className="text-xs uppercase tracking-wide text-ink-muted">{t('stats.published')}</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{statusCounts.published}</p>
        </Card>
        <Card className="p-4 sm:p-5">
          <p className="text-xs uppercase tracking-wide text-ink-muted">{t('stats.drafts')}</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{statusCounts.draft}</p>
        </Card>
        <Card className="p-4 sm:p-5">
          <p className="text-xs uppercase tracking-wide text-ink-muted">{t('stats.apartments')}</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{apartmentsTotal}</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/builder/projects"
            className="inline-flex h-9 items-center rounded-[15px] border border-border-strong px-4 text-sm font-medium text-ink hover:bg-surface"
          >
            {t('links.projects')}
          </Link>
          <Link
            href="/builder/team"
            className="inline-flex h-9 items-center rounded-[15px] border border-border-strong px-4 text-sm font-medium text-ink hover:bg-surface"
          >
            {t('links.team')}
          </Link>
          <Link
            href="/builder/crm"
            className="inline-flex h-9 items-center rounded-[15px] border border-border-strong px-4 text-sm font-medium text-ink hover:bg-surface"
          >
            {t('links.crm')}
          </Link>
          <Link
            href="/builder/scanner"
            className="inline-flex h-9 items-center rounded-[15px] border border-border-strong px-4 text-sm font-medium text-ink hover:bg-surface"
          >
            {t('links.scanner')}
          </Link>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="shrink-0"
          onClick={() => {
            setCreateOpen(true);
          }}
        >
          <AddActionLabel>{t('links.newProject')}</AddActionLabel>
        </Button>
      </div>

      <CrmDashboardWidget />

      <CreateProjectSheet
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
        }}
      />
    </div>
  );
};
