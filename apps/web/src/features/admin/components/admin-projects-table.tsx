'use client';

import type { AdminProjectListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import type { KeyboardEvent } from 'react';

import { AdminProjectCard } from '@/features/admin/components/admin-project-card';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { useRouter } from '@/i18n/navigation';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { cn } from '@/shared/ui/cn';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';
import { ListTableReveal } from '@/shared/ui/motion';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type AdminProjectsTableProps = {
  projects: AdminProjectListItem[];
  viewMode?: ViewMode | undefined;
  /** Active search term: cards drop in again whenever the query changes. */
  searchKey?: string | undefined;
  onOpenBuildings?: ((project: AdminProjectListItem) => void) | undefined;
};

const projectHref = (project: AdminProjectListItem): string => `/admin/projects/${project.id}`;

/**
 * Admin cross-company projects collection as cards or table.
 */
export const AdminProjectsTable = ({
  projects,
  viewMode = VIEW_MODE_CARDS,
  searchKey = '',
  onOpenBuildings,
}: AdminProjectsTableProps) => {
  const t = useTranslations('Admin.projects');
  const router = useRouter();

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <AdminListCardGrid
        key={searchKey}
        className={cn(
          'gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          searchKey.length > 0 && 'search-results-drop-in',
        )}
      >
        {projects.map((project) => (
          <AdminProjectCard key={project.id} project={project} onOpenBuildings={onOpenBuildings} />
        ))}
      </AdminListCardGrid>
    );
  }

  const openProject = (project: AdminProjectListItem): void => {
    router.push(projectHref(project));
  };

  const onRowKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    project: AdminProjectListItem,
  ): void => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    openProject(project);
  };

  return (
    <ListTableReveal>
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
              <tr
                key={project.id}
                tabIndex={0}
                className="cursor-pointer border-t border-border hover:bg-surface/60 focus-visible:bg-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/30"
                onClick={() => {
                  openProject(project);
                }}
                onKeyDown={(event) => {
                  onRowKeyDown(event, project);
                }}
              >
                <td className="px-3 py-2.5 align-middle font-medium text-brand">{project.name}</td>
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
                  {onOpenBuildings ? (
                    <button
                      type="button"
                      aria-label={t('openBuildings', { name: project.name })}
                      className="font-medium text-brand hover:underline"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenBuildings(project);
                      }}
                    >
                      {project.buildingsCount}
                    </button>
                  ) : (
                    project.buildingsCount
                  )}
                </td>
                <td className="px-3 py-2.5 text-center align-middle text-ink-secondary">
                  {project.apartmentsCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ListTableReveal>
  );
};
