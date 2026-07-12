'use client';

import type { PublicationStatus } from '@toonexpo/domain';

import { Link } from '@/i18n/navigation';
import type { BuilderProjectRow } from '@/lib/builder/queries';

import { STATUS_BADGE_CLASS, publicationActionsFor } from '@/lib/shared/publication';
import { PublicationActionButton } from './publication-action-button';

type ProjectsTableProps = {
  locale: string;
  projects: BuilderProjectRow[];
  labels: {
    noCity: string;
    columns: {
      name: string;
      city: string;
      status: string;
      buildings: string;
      updatedAt: string;
      actions: string;
    };
  };
  statusLabels: Record<PublicationStatus, string>;
};

function formatProjectDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

export function ProjectsTable({
  locale,
  projects,
  labels,
  statusLabels,
}: ProjectsTableProps) {
  return (
    <div className="portal-table-wrap">
      <table className="portal-table">
        <thead>
          <tr>
            <th>{labels.columns.name}</th>
            <th>{labels.columns.city}</th>
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
              labels={labels}
              statusLabels={statusLabels}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

type ProjectRowProps = {
  locale: string;
  project: BuilderProjectRow;
  labels: ProjectsTableProps['labels'];
  statusLabels: Record<PublicationStatus, string>;
};

function ProjectRow({ locale, project, labels, statusLabels }: ProjectRowProps) {
  const actions = publicationActionsFor(project.status);

  return (
    <tr>
      <td>
        <Link className="portal-link" href={`/portal/projects/${project.id}`}>
          {project.name}
        </Link>
      </td>
      <td>{project.city ?? labels.noCity}</td>
      <td>
        <span className={STATUS_BADGE_CLASS[project.status]}>{statusLabels[project.status]}</span>
      </td>
      <td>{project.buildingsCount}</td>
      <td>{formatProjectDate(project.updatedAt, locale)}</td>
      <td>
        <div className="portal-actions">
          {actions.map((action) => (
            <PublicationActionButton
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
