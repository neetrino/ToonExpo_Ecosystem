'use client';

import { catalogProjectsListHref } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { useTranslations } from 'next-intl';

import { PortalCanvasEditorPage } from '@/features/visual-map/components/portal-canvas-editor-page';
import { usePortalProjectQuery } from '@/features/builder/hooks/use-portal-projects';
import { Link } from '@/i18n/navigation';

type PortalCanvasEditorShellProps = {
  projectId: string;
  canvasId: string;
};

/**
 * Loads project context for the visual canvas editor page.
 */
export const PortalCanvasEditorShell = ({ projectId, canvasId }: PortalCanvasEditorShellProps) => {
  const scope = useCatalogScope();
  const t = useTranslations('Builder.projects');
  const query = usePortalProjectQuery(projectId);

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex flex-col gap-3">
        <p role="alert" className="text-sm text-danger">
          {t('detail.notFound')}
        </p>
        <Link
          href={catalogProjectsListHref(scope)}
          className="text-sm font-medium text-brand hover:underline"
        >
          {t('detail.back')}
        </Link>
      </div>
    );
  }

  return <PortalCanvasEditorPage project={query.data} canvasId={canvasId} />;
};
