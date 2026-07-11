'use client';

import type { PublicationStatus } from '@toonexpo/domain';

import { STATUS_BADGE_CLASS, publicationActionsFor } from '@/lib/shared/publication';
import type { AdminProjectRow } from '@/lib/admin/queries';

import { AdminPublicationActionButton } from './admin-publication-action-button';

type AdminProjectsTableProps = {
  locale: string;
  projects: AdminProjectRow[];
  labels: {
    columns: {
      company: string;
      name: string;
      status: string;
      buildings: string;
      updatedAt: string;
      actions: string;
    };
  };
  statusLabels: Record<PublicationStatus, string>;
  formatDate: (date: Date) => string;
};

export function AdminProjectsTable({
  locale,
  projects,
  labels,
  statusLabels,
  formatDate,
}: AdminProjectsTableProps) {
  return (
    <div className="portal-table-wrap">
      <table className="portal-table">
        <thead>
          <tr>
            <th>{labels.columns.company}</th>
            <th>{labels.columns.name}</th>
            <th>{labels.columns.status}</th>
            <th>{labels.columns.buildings}</th>
            <th>{labels.columns.updatedAt}</th>
            <th>{labels.columns.actions}</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              locale={locale}
              project={project}
              statusLabels={statusLabels}
              formatDate={formatDate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

type ProjectRowProps = {
  locale: string;
  project: AdminProjectRow;
  statusLabels: Record<PublicationStatus, string>;
  formatDate: (date: Date) => string;
};

function ProjectRow({ locale, project, statusLabels, formatDate }: ProjectRowProps) {
  const actions = publicationActionsFor(project.status);

  return (
    <tr>
      <td>{project.companyName}</td>
      <td>{project.name}</td>
      <td>
        <span className={STATUS_BADGE_CLASS[project.status]}>{statusLabels[project.status]}</span>
      </td>
      <td>{project.buildingsCount}</td>
      <td>{formatDate(project.updatedAt)}</td>
      <td>
        <div className="portal-actions">
          {actions.map((action) => (
            <AdminPublicationActionButton
              key={action.actionKey}
              locale={locale}
              projectId={project.id}
              targetStatus={action.targetStatus}
              actionKey={action.actionKey}
            />
          ))}
        </div>
      </td>
    </tr>
  );
}
