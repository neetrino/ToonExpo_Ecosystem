import type { PublicationStatus } from '@toonexpo/domain';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { loadAllProjects } from '@/lib/admin/queries';
import { parseProjectStatusFilter } from '@/lib/admin/project-status-filter';

import { AdminProjectsTable } from './admin-projects-table';
import { ProjectStatusFilter } from './project-status-filter';

type AdminProjectsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminProjectsPage({ params, searchParams }: AdminProjectsPageProps) {
  const { locale } = await params;
  const { status: rawStatus } = await searchParams;
  setRequestLocale(locale);

  const statusFilter = parseProjectStatusFilter(rawStatus);

  const [t, tStatus, projects] = await Promise.all([
    getTranslations('admin.projects'),
    getTranslations('admin.projects.status'),
    loadAllProjects(statusFilter),
  ]);

  const statusLabels: Record<PublicationStatus, string> = {
    DRAFT: tStatus('DRAFT'),
    PUBLISHED: tStatus('PUBLISHED'),
    ARCHIVED: tStatus('ARCHIVED'),
  };

  return (
    <section>
      <div className="portal-page__header">
        <h2 className="portal-page__title">{t('title')}</h2>
        <ProjectStatusFilter
          currentStatus={statusFilter}
          labels={{
            all: t('filter.all'),
            ariaLabel: t('filter.ariaLabel'),
            DRAFT: statusLabels.DRAFT,
            PUBLISHED: statusLabels.PUBLISHED,
            ARCHIVED: statusLabels.ARCHIVED,
          }}
        />
      </div>

      {projects.length === 0 ? (
        <p className="portal-empty">{t('empty')}</p>
      ) : (
        <AdminProjectsTable
          locale={locale}
          projects={projects}
          labels={{
            columns: {
              company: t('columns.company'),
              name: t('columns.name'),
              status: t('columns.status'),
              buildings: t('columns.buildings'),
              updatedAt: t('columns.updatedAt'),
              actions: t('columns.actions'),
            },
          }}
          statusLabels={statusLabels}
        />
      )}
    </section>
  );
}
