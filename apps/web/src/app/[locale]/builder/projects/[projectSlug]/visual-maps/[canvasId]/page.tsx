import { setRequestLocale } from 'next-intl/server';

import { PortalCanvasEditorShell } from '@/features/visual-map/components/portal-canvas-editor-shell';

type BuilderVisualMapEditorPageProps = {
  params: Promise<{ locale: string; projectSlug: string; canvasId: string }>;
};

/**
 * Builder portal visual canvas editor route (slug in URL).
 */
export default async function BuilderVisualMapEditorPage({
  params,
}: BuilderVisualMapEditorPageProps) {
  const { locale, projectSlug, canvasId } = await params;
  setRequestLocale(locale);

  return <PortalCanvasEditorShell projectId={projectSlug} canvasId={canvasId} />;
}
