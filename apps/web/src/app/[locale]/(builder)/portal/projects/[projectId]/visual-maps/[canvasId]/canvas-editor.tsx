'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

import { Link } from '@/i18n/navigation';
import type { BuilderProjectDetail } from '@/lib/builder/queries';
import { computeHotspotPercent } from '@/lib/visual-map/hotspot-geometry';
import type { BuilderArchivedHotspot, BuilderCanvasDetail } from '@/lib/visual-map/queries';
import { resolveCanvasContextLabel } from '@/lib/visual-map/editor-helpers';
import { STATUS_BADGE_CLASS } from '@/lib/shared/publication';

import { CanvasArchivedHotspots } from './canvas-archived-hotspots';
import { CanvasPublicationActions } from './canvas-publication-actions';
import { HotspotFormSheet } from './hotspot-form-sheet';

type CanvasEditorProps = {
  locale: string;
  project: BuilderProjectDetail;
  canvas: BuilderCanvasDetail;
  archivedHotspots: BuilderArchivedHotspot[];
  statusLabel: string;
  contextLabels: { project: string; building: string; floor: string };
};

type EditorSheet =
  | { kind: 'closed' }
  | { kind: 'create'; x: number; y: number }
  | { kind: 'edit'; hotspotId: string; x: number; y: number };

export function CanvasEditor({
  locale,
  project,
  canvas,
  archivedHotspots,
  statusLabel,
  contextLabels,
}: CanvasEditorProps) {
  const t = useTranslations('portal.visualMap.editor');
  const imageRef = useRef<HTMLImageElement>(null);
  const [sheet, setSheet] = useState<EditorSheet>({ kind: 'closed' });
  const [pickingPosition, setPickingPosition] = useState(false);

  const contextLabel = resolveCanvasContextLabel(project, canvas, contextLabels);
  const title = canvas.title ?? t('untitled');

  function handleImageClick(event: React.MouseEvent<HTMLImageElement>): void {
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const coords = computeHotspotPercent(rect, event.clientX, event.clientY);

    if (pickingPosition && sheet.kind === 'edit') {
      setPickingPosition(false);
      setSheet({ kind: 'edit', hotspotId: sheet.hotspotId, x: coords.x, y: coords.y });
      return;
    }

    setSheet({ kind: 'create', x: coords.x, y: coords.y });
  }

  function handleMarkerClick(event: React.MouseEvent, hotspotId: string): void {
    event.stopPropagation();
    const hotspot = canvas.hotspots.find((item) => item.id === hotspotId);
    if (!hotspot) {
      return;
    }
    setPickingPosition(false);
    setSheet({ kind: 'edit', hotspotId, x: hotspot.x, y: hotspot.y });
  }

  const canvasClass = pickingPosition
    ? 'portal-visual-map-canvas portal-visual-map-canvas--picking'
    : 'portal-visual-map-canvas';

  return (
    <div className="portal-visual-map-editor">
      <header className="portal-visual-map-editor__header">
        <div>
          <Link className="portal-link" href={`/portal/projects/${project.id}`}>
            {t('backToProject')}
          </Link>
          <h2 className="portal-page__title">{title}</h2>
          <p className="portal-visual-map-hint">
            {contextLabel} ·{' '}
            <span className={STATUS_BADGE_CLASS[canvas.status]}>{statusLabel}</span>
          </p>
        </div>
        <CanvasPublicationActions
          locale={locale}
          projectId={project.id}
          canvasId={canvas.id}
          status={canvas.status}
        />
      </header>

      <p className="portal-visual-map-hint">
        {pickingPosition ? t('pickingHint') : t('clickHint')}
      </p>

      <div className={canvasClass}>
        <img
          ref={imageRef}
          src={canvas.imageUrl}
          alt={canvas.imageAlt ?? title}
          className="portal-visual-map-canvas__image"
          onClick={handleImageClick}
        />
        <div className="portal-visual-map-canvas__overlay">
          {canvas.hotspots.map((hotspot) => (
            <button
              key={hotspot.id}
              type="button"
              className={
                sheet.kind === 'edit' && sheet.hotspotId === hotspot.id
                  ? 'portal-visual-map-marker portal-visual-map-marker--selected'
                  : 'portal-visual-map-marker'
              }
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              aria-label={hotspot.label ?? t('marker')}
              onClick={(event) => handleMarkerClick(event, hotspot.id)}
            />
          ))}
        </div>
      </div>

      <CanvasArchivedHotspots locale={locale} archivedHotspots={archivedHotspots} />

      <HotspotFormSheet
        key={
          sheet.kind === 'closed'
            ? 'closed'
            : `${sheet.kind}-${sheet.kind === 'edit' ? sheet.hotspotId : 'new'}-${sheet.x}-${sheet.y}`
        }
        locale={locale}
        project={project}
        canvas={canvas}
        mode={sheet.kind === 'edit' ? 'edit' : 'create'}
        open={sheet.kind !== 'closed'}
        onClose={() => {
          setSheet({ kind: 'closed' });
          setPickingPosition(false);
        }}
        coords={sheet.kind === 'closed' ? { x: 50, y: 50 } : { x: sheet.x, y: sheet.y }}
        hotspotId={sheet.kind === 'edit' ? sheet.hotspotId : undefined}
        onPickPosition={
          sheet.kind === 'edit'
            ? () => {
                setPickingPosition(true);
              }
            : undefined
        }
        pickingPosition={pickingPosition}
      />
    </div>
  );
}
