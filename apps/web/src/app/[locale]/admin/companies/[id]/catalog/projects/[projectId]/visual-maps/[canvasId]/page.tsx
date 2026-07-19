import { setRequestLocale } from 'next-intl/server';

import { AdminCompanyCatalogShell } from '@/features/admin/components/admin-company-catalog-shell';
import { PortalCanvasEditorShell } from '@/features/visual-map/components/portal-canvas-editor-shell';

type PageProps = {
  params: Promise<{
    locale: string;
    id: string;
    projectId: string;
    canvasId: string;
  }>;
};

/**
 * Admin visual map editor for a company project.
 */
export default async function AdminCompanyCatalogVisualMapPage({ params }: PageProps) {
  const { locale, id, projectId, canvasId } = await params;
  setRequestLocale(locale);

  return (
    <AdminCompanyCatalogShell companyId={id}>
      <PortalCanvasEditorShell projectId={projectId} canvasId={canvasId} />
    </AdminCompanyCatalogShell>
  );
}
