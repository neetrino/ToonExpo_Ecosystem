import { setRequestLocale } from 'next-intl/server';

import { CanvasEditorClient } from './canvas-editor-client';

type CanvasEditorPageProps = {
  params: Promise<{ locale: string; projectId: string; canvasId: string }>;
};

export default async function CanvasEditorPage({ params }: CanvasEditorPageProps) {
  const { locale, projectId, canvasId } = await params;
  setRequestLocale(locale);
  return <CanvasEditorClient projectId={projectId} canvasId={canvasId} />;
}
