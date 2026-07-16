import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';
import { LOGIN_PATH } from '@/lib/auth/constants';
import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import { loadCompanyProjectDetail } from '@/lib/builder/queries';
import { getCanvasForEdit, listArchivedHotspotsForCanvas } from '@/lib/visual-map/queries';

import { CanvasEditor } from './canvas-editor';

type CanvasEditorPageProps = {
  params: Promise<{ locale: string; projectId: string; canvasId: string }>;
};

export default async function CanvasEditorPage({ params }: CanvasEditorPageProps) {
  const { locale, projectId, canvasId } = await params;
  setRequestLocale(locale);

  const builderContext = await assertBuilderSession();
  if (!builderContext) {
    return redirect({ href: LOGIN_PATH, locale });
  }

  const [project, canvas, archivedHotspots] = await Promise.all([
    loadCompanyProjectDetail(builderContext.companyId, projectId),
    getCanvasForEdit(builderContext.companyId, canvasId),
    listArchivedHotspotsForCanvas(builderContext.companyId, canvasId),
  ]);

  if (!project || !canvas) {
    notFound();
  }

  const [t, tStatus] = await Promise.all([
    getTranslations('portal.visualMap'),
    getTranslations('portal.projects.status'),
  ]);

  return (
    <section>
      <CanvasEditor
        locale={locale}
        project={project}
        canvas={canvas}
        archivedHotspots={archivedHotspots}
        statusLabel={tStatus(canvas.status)}
        contextLabels={{
          project: t('context.project'),
          building: t('context.building'),
          floor: t('context.floor'),
        }}
      />
    </section>
  );
}
