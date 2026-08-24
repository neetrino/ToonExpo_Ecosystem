'use client';

import { useAdminProjectRoute } from '@/features/admin/context/admin-project-route-context';
import { PortalCanvasEditorShell } from '@/features/visual-map/components/portal-canvas-editor-shell';

type AdminProjectVisualMapViewProps = {
  canvasId: string;
};

/**
 * Admin visual map editor bound to the resolved project route.
 */
export const AdminProjectVisualMapView = ({ canvasId }: AdminProjectVisualMapViewProps) => {
  const { projectId } = useAdminProjectRoute();
  return <PortalCanvasEditorShell projectId={projectId} canvasId={canvasId} />;
};
