'use client';

import type { PortalProjectListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import type { KeyboardEvent } from 'react';

import { BuilderProjectCard } from '@/features/builder/components/builder-project-card';
import { catalogProjectDetailHref } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { useRouter } from '@/i18n/navigation';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { ListTableReveal } from '@/shared/ui/motion';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type ProjectsTableProps = {
  projects: PortalProjectListItem[];
  viewMode?: ViewMode | undefined;
};

/**
 * Projects collection as cards (admin-matching) or table for portal lists.
 */
export const ProjectsTable = ({ projects, viewMode = VIEW_MODE_CARDS }: ProjectsTableProps) => {
  const t = useTranslations('Builder.projects');
  const scope = useCatalogScope();
  const router = useRouter();

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <AdminListCardGrid className="gap-4">
        {projects.map((project) => (
          <BuilderProjectCard key={project.id} project={project} />
        ))}
      </AdminListCardGrid>
    );
  }

  const openProject = (projectId: string): void => {
    router.push(catalogProjectDetailHref(scope, projectId));
  };

  const onRowKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    projectId: string,
  ): void => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    openProject(projectId);
  };

  return (
    <ListTableReveal>
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
              <tr
                key={project.id}
                tabIndex={0}
                className="cursor-pointer border-t border-border hover:bg-surface/60 focus-visible:bg-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/30"
                onClick={() => {
                  openProject(project.id);
                }}
                onKeyDown={(event) => {
                  onRowKeyDown(event, project.id);
                }}
              >
                <td className="px-3 py-2.5 align-middle font-medium text-brand">{project.name}</td>
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
    </ListTableReveal>
  );
};
