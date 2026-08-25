'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { catalogProjectDetailHref, catalogProjectsListHref } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { EditProjectForm } from '@/features/builder/components/edit-project-form';
import { ProjectInventorySection } from '@/features/builder/components/project-inventory-section';
import { ProjectPublicationActions } from '@/features/builder/components/project-publication-actions';
import { ProjectQrDialog } from '@/features/builder/components/project-qr-dialog';
import { usePortalProjectQuery } from '@/features/builder/hooks/use-portal-projects';
import { PortalVisualCanvasesSection } from '@/features/visual-map/components/portal-visual-canvases-section';
import { useRouter } from '@/i18n/navigation';
import { AdminListCardLogo } from '@/shared/ui/admin-list-card-logo';
import { BackLink } from '@/shared/ui/back-link';
import { Card } from '@/shared/ui/card';

/** Matches public project hero builder mark on small screens. */
const TITLE_LOGO_CLASS = 'size-14';

export type ProjectDetailTitleLogo = {
  name: string;
  logoUrl: string | null;
};

type ProjectDetailPageProps = {
  projectId: string;
  /** Builder keeps inventory on the project page; admin uses the Buildings hub sheets. */
  showInventory?: boolean | undefined;
  /** Company mark shown before the project title. */
  titleLogo?: ProjectDetailTitleLogo | undefined;
};

type ProjectDetailHeadingProps = {
  name: string;
  titleLogo: ProjectDetailTitleLogo | undefined;
};

const ProjectDetailHeading = ({ name, titleLogo }: ProjectDetailHeadingProps) => (
  <div className="flex min-w-0 items-center gap-3">
    {titleLogo ? (
      <AdminListCardLogo
        name={titleLogo.name}
        logoUrl={titleLogo.logoUrl}
        shape="circle"
        className={TITLE_LOGO_CLASS}
      />
    ) : null}
    <h1 className="min-w-0 text-page-title text-ink">{name}</h1>
  </div>
);

/**
 * Project edit shell with publication actions and inventory hierarchy.
 */
export const ProjectDetailPage = ({
  projectId,
  showInventory = true,
  titleLogo,
}: ProjectDetailPageProps) => {
  const t = useTranslations('Builder.projects');
  const tQr = useTranslations('Builder.projects.qr');
  const scope = useCatalogScope();
  const router = useRouter();
  const query = usePortalProjectQuery(projectId);
  const listHref = catalogProjectsListHref(scope);
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    const project = query.data;
    if (scope.mode !== 'portal' || !project || projectId === project.slug) {
      return;
    }
    router.replace(catalogProjectDetailHref(scope, project.slug));
  }, [projectId, query.data, router, scope]);

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex flex-col gap-3">
        <p role="alert" className="text-sm text-danger">
          {t('detail.notFound')}
        </p>
        <BackLink href={listHref} label={t('detail.back')} />
      </div>
    );
  }

  const project = query.data;

  return (
    <div className="flex flex-col gap-8 pb-24">
      <div className="flex flex-col gap-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackLink href={listHref} label={t('detail.back')} />
          <ProjectPublicationActions
            project={project}
            qrLabel={tQr('open')}
            onOpenQr={() => {
              setQrOpen(true);
            }}
          />
        </div>
        <ProjectDetailHeading name={project.name} titleLogo={titleLogo} />
      </div>

      <Card>
        <EditProjectForm key={project.id} project={project} />
      </Card>

      <PortalVisualCanvasesSection project={project} />

      {showInventory ? <ProjectInventorySection project={project} /> : null}

      <ProjectQrDialog
        open={qrOpen}
        onClose={() => {
          setQrOpen(false);
        }}
        projectId={project.id}
        projectName={project.name}
      />
    </div>
  );
};
