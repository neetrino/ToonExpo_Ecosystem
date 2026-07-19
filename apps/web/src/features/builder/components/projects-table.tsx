'use client';

import type { PortalProjectListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { catalogProjectDetailHref } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type ProjectsTableProps = {
  projects: PortalProjectListItem[];
};

const statusClassName: Record<PortalProjectListItem['publicationStatus'], string> = {
  draft: 'bg-surface text-ink-secondary',
  published: 'bg-brand/10 text-brand',
  archived: 'bg-danger-soft text-danger',
};

/**
 * Projects table for the builder portal list.
 */
export const ProjectsTable = ({ projects }: ProjectsTableProps) => {
  const t = useTranslations('Builder.projects');
  const scope = useCatalogScope();

  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th className="px-3 py-2 font-medium">{t('columns.name')}</th>
            <th className="px-3 py-2 font-medium">{t('columns.status')}</th>
            <th className="px-3 py-2 font-medium">{t('columns.city')}</th>
            <th className="px-3 py-2 font-medium">{t('columns.buildings')}</th>
            <th className="px-3 py-2 font-medium">{t('columns.apartments')}</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-t border-border hover:bg-surface/60">
              <td className="px-3 py-2.5">
                <Link
                  href={catalogProjectDetailHref(scope, project.id)}
                  className="font-medium text-brand hover:underline"
                >
                  {project.name}
                </Link>
              </td>
              <td className="px-3 py-2.5">
                <span
                  className={cn(
                    'inline-flex rounded-sm px-2 py-0.5 text-xs font-medium',
                    statusClassName[project.publicationStatus],
                  )}
                >
                  {t(`publication.${project.publicationStatus}`)}
                </span>
              </td>
              <td className="px-3 py-2.5 text-ink-secondary">{project.city ?? '—'}</td>
              <td className="px-3 py-2.5 text-ink-secondary">{project.buildingsCount}</td>
              <td className="px-3 py-2.5 text-ink-secondary">{project.apartmentsCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
