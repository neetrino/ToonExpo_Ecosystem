'use client';

import type { AdminProjectListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { Link } from '@/i18n/navigation';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type AdminProjectsTableProps = {
  projects: AdminProjectListItem[];
  viewMode?: ViewMode | undefined;
};

const projectHref = (project: AdminProjectListItem): string => `/admin/projects/${project.id}`;

/**
 * Admin cross-company projects collection as cards or table.
 */
export const AdminProjectsTable = ({
  projects,
  viewMode = VIEW_MODE_CARDS,
}: AdminProjectsTableProps) => {
  const t = useTranslations('Admin.projects');

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <AdminListCardGrid>
        {projects.map((project) => (
          <Link
            key={project.id}
            href={projectHref(project)}
            className="flex flex-col gap-2 rounded-sm border border-border bg-background p-3 transition-colors hover:bg-surface/60"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate font-medium text-ink">{project.name}</span>
              <PublicationStatusBadge
                status={project.publicationStatus}
                className={LIST_STATUS_BADGE_COMPACT_CLASS}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
              <span className="truncate">{project.companyName}</span>
              <span aria-hidden>·</span>
              <span>{project.city ?? '—'}</span>
              <span aria-hidden>·</span>
              <span>
                {t('columns.buildings')}: {project.buildingsCount}
              </span>
              <span aria-hidden>·</span>
              <span>
                {t('columns.apartments')}: {project.apartmentsCount}
              </span>
            </div>
          </Link>
        ))}
      </AdminListCardGrid>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full min-w-[48rem] border-collapse text-sm">
        <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th className="px-3 py-2.5 text-left font-medium">{t('columns.name')}</th>
            <th className="px-3 py-2.5 text-left font-medium">{t('columns.company')}</th>
            <th className="px-3 py-2.5 text-center font-medium">{t('columns.status')}</th>
            <th className="px-3 py-2.5 text-center font-medium">{t('columns.city')}</th>
            <th className="px-3 py-2.5 text-center font-medium">{t('columns.buildings')}</th>
            <th className="px-3 py-2.5 text-center font-medium">{t('columns.apartments')}</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-t border-border hover:bg-surface/60">
              <td className="px-3 py-2.5 align-middle">
                <Link
                  href={projectHref(project)}
                  className="font-medium text-brand hover:underline"
                >
                  {project.name}
                </Link>
              </td>
              <td className="px-3 py-2.5 align-middle text-ink-secondary">{project.companyName}</td>
              <td className="px-3 py-2.5 text-center align-middle">
                <PublicationStatusBadge
                  status={project.publicationStatus}
                  className={LIST_STATUS_BADGE_COMPACT_CLASS}
                />
              </td>
              <td className="px-3 py-2.5 text-center align-middle text-ink-secondary">
                {project.city ?? '—'}
              </td>
              <td className="px-3 py-2.5 text-center align-middle text-ink-secondary">
                {project.buildingsCount}
              </td>
              <td className="px-3 py-2.5 text-center align-middle text-ink-secondary">
                {project.apartmentsCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
