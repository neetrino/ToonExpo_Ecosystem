'use client';

import { useTranslations } from 'next-intl';

import { EditProjectForm } from '@/features/builder/components/edit-project-form';
import { ProjectInventorySection } from '@/features/builder/components/project-inventory-section';
import { ProjectPublicationActions } from '@/features/builder/components/project-publication-actions';
import { ProjectQrSection } from '@/features/builder/components/project-qr-section';
import { catalogProjectsListHref } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { usePortalProjectQuery } from '@/features/builder/hooks/use-portal-projects';
import { PortalVisualCanvasesSection } from '@/features/visual-map/components/portal-visual-canvases-section';
import { Link } from '@/i18n/navigation';
import { Card } from '@/shared/ui/card';

type ProjectDetailPageProps = {
  projectId: string;
};

/**
 * Project edit shell with publication actions and inventory hierarchy.
 */
export const ProjectDetailPage = ({ projectId }: ProjectDetailPageProps) => {
  const t = useTranslations('Builder.projects');
  const scope = useCatalogScope();
  const query = usePortalProjectQuery(projectId);
  const listHref = catalogProjectsListHref(scope);

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex flex-col gap-3">
        <p role="alert" className="text-sm text-danger">
          {t('detail.notFound')}
        </p>
        <Link href={listHref} className="text-sm font-medium text-brand hover:underline">
          {t('detail.back')}
        </Link>
      </div>
    );
  }

  const project = query.data;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Link href={listHref} className="text-sm text-ink-secondary hover:text-ink">
            {t('detail.back')}
          </Link>
          <h1 className="text-xl font-semibold text-ink">{project.name}</h1>
          <p className="text-sm text-ink-secondary">
            {t(`publication.${project.publicationStatus}`)}
          </p>
        </div>
        <ProjectPublicationActions project={project} />
      </div>

      <Card>
        <EditProjectForm project={project} />
      </Card>

      <ProjectQrSection projectId={project.id} projectName={project.name} />

      <PortalVisualCanvasesSection project={project} />

      <ProjectInventorySection project={project} />
    </div>
  );
};
