'use client';

import type { PortalProjectListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { catalogProjectDetailHref } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { Link } from '@/i18n/navigation';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type ProjectsTableProps = {
  projects: PortalProjectListItem[];
  viewMode?: ViewMode | undefined;
};

/**
 * Projects collection as table or card grid for portal lists.
 */
export const ProjectsTable = ({ projects, viewMode = VIEW_MODE_CARDS }: ProjectsTableProps) => {
  const t = useTranslations('Builder.projects');
  const scope = useCatalogScope();

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <AdminListCardGrid>
        {projects.map((project) => (
          <Link
            key={project.id}
            href={catalogProjectDetailHref(scope, project.id)}
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
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th className="px-3 py-2.5 text-left font-medium">{t('columns.name')}</th>
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
                  href={catalogProjectDetailHref(scope, project.id)}
                  className="font-medium text-brand hover:underline"
                >
                  {project.name}
                </Link>
              </td>
              <td className="px-3 py-2.5 align-middle">
                <div className="flex justify-center">
                  <PublicationStatusBadge status={project.publicationStatus} />
                </div>
              </td>
              <td className="px-3 py-2.5 align-middle text-center text-ink-secondary">
                {project.city ?? '—'}
              </td>
              <td className="px-3 py-2.5 align-middle text-center text-ink-secondary">
                {project.buildingsCount}
              </td>
              <td className="px-3 py-2.5 align-middle text-center text-ink-secondary">
                {project.apartmentsCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
