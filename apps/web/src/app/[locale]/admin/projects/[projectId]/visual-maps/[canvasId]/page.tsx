import { setRequestLocale } from 'next-intl/server';

import { AdminProjectScopeShell } from '@/features/admin/components/admin-project-scope-shell';
import { PortalCanvasEditorShell } from '@/features/visual-map/components/portal-canvas-editor-shell';

type PageProps = {
  params: Promise<{
    locale: string;
    projectId: string;
    canvasId: string;
  }>;
};

/**
 * Admin visual map editor under the Projects hub.
 */
export default async function AdminProjectVisualMapPage({ params }: PageProps) {
  const { locale, projectId, canvasId } = await params;
  setRequestLocale(locale);

  return (
    <AdminProjectScopeShell projectId={projectId}>
      <PortalCanvasEditorShell projectId={projectId} canvasId={canvasId} />
    </AdminProjectScopeShell>
  );
}
