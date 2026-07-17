'use client';

import { notFound } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import { loadCompanyProjectDetail, type BuilderProjectDetail } from '@/lib/builder/queries';
import {
  getCanvasForEdit,
  listArchivedHotspotsForCanvas,
  type BuilderArchivedHotspot,
  type BuilderCanvasDetail,
} from '@/lib/visual-map/queries';

import { CanvasEditor } from './canvas-editor';

type CanvasEditorData = {
  project: BuilderProjectDetail;
  canvas: BuilderCanvasDetail;
  archivedHotspots: BuilderArchivedHotspot[];
};

type CanvasEditorClientProps = {
  projectId: string;
  canvasId: string;
};

export function CanvasEditorClient({ projectId, canvasId }: CanvasEditorClientProps) {
  const locale = useLocale();
  const t = useTranslations('portal.visualMap');
  const tStatus = useTranslations('portal.projects.status');
  const [data, setData] = useState<CanvasEditorData | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const builderContext = await assertBuilderSession();
      if (!builderContext || cancelled) {
        return;
      }
      const [project, canvas, archivedHotspots] = await Promise.all([
        loadCompanyProjectDetail(builderContext.companyId, projectId),
        getCanvasForEdit(builderContext.companyId, canvasId),
        listArchivedHotspotsForCanvas(builderContext.companyId, canvasId),
      ]);
      if (cancelled) {
        return;
      }
      if (!project || !canvas) {
        setMissing(true);
        return;
      }
      setData({ project, canvas, archivedHotspots });
    })();
    return () => {
      cancelled = true;
    };
  }, [canvasId, projectId]);

  if (missing) {
    notFound();
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  return (
    <section>
      <CanvasEditor
        locale={locale}
        project={data.project}
        canvas={data.canvas}
        archivedHotspots={data.archivedHotspots}
        statusLabel={tStatus(data.canvas.status)}
        contextLabels={{
          project: t('context.project'),
          building: t('context.building'),
          floor: t('context.floor'),
        }}
      />
    </section>
  );
}
