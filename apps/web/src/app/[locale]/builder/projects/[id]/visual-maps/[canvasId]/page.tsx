import { setRequestLocale } from "next-intl/server";

import { PortalCanvasEditorShell } from "@/features/visual-map/components/portal-canvas-editor-shell";

type BuilderVisualMapEditorPageProps = {
  params: Promise<{ locale: string; id: string; canvasId: string }>;
};

/**
 * Builder portal visual canvas editor route.
 */
export default async function BuilderVisualMapEditorPage({
  params,
}: BuilderVisualMapEditorPageProps) {
  const { locale, id, canvasId } = await params;
  setRequestLocale(locale);

  return <PortalCanvasEditorShell projectId={id} canvasId={canvasId} />;
}
