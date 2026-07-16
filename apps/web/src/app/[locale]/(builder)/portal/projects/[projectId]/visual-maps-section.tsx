'use client';

import { useState } from 'react';

import { Link } from '@/i18n/navigation';
import type { BuilderCanvasSummary } from '@/lib/visual-map/queries';
import type { BuilderProjectDetail } from '@/lib/builder/queries';
import { resolveCanvasContextLabel } from '@/lib/visual-map/editor-helpers';
import { STATUS_BADGE_CLASS } from '@/lib/shared/publication';

import { CanvasFormSheet } from '../sheets/canvas-form-sheet';

type VisualMapsSectionProps = {
  locale: string;
  project: BuilderProjectDetail;
  canvases: BuilderCanvasSummary[];
  labels: {
    title: string;
    newCanvas: string;
    empty: string;
    hotspotCount: string;
    untitled: string;
    context: { project: string; building: string; floor: string };
  };
  statusLabels: Record<'DRAFT' | 'PUBLISHED' | 'ARCHIVED', string>;
};

export function VisualMapsSection({
  locale,
  project,
  canvases,
  labels,
  statusLabels,
}: VisualMapsSectionProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <section className="portal-section">
      <div className="portal-section__header">
        <h3 className="portal-section__title">{labels.title}</h3>
        <button
          type="button"
          className="portal-btn portal-btn--primary"
          onClick={() => setCreateOpen(true)}
        >
          {labels.newCanvas}
        </button>
      </div>

      {canvases.length === 0 ? (
        <p className="portal-empty">{labels.empty}</p>
      ) : (
        <div className="portal-visual-map__grid">
          {canvases.map((canvas) => (
            <VisualMapCard
              key={canvas.id}
              projectId={project.id}
              canvas={canvas}
              contextLabel={resolveCanvasContextLabel(project, canvas, labels.context)}
              statusLabel={statusLabels[canvas.status]}
              title={canvas.title ?? labels.untitled}
              hotspotCountLabel={labels.hotspotCount.replace(
                '{count}',
                String(canvas.hotspotCount),
              )}
            />
          ))}
        </div>
      )}

      <CanvasFormSheet
        locale={locale}
        project={project}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </section>
  );
}

type VisualMapCardProps = {
  projectId: string;
  canvas: BuilderCanvasSummary;
  contextLabel: string;
  statusLabel: string;
  title: string;
  hotspotCountLabel: string;
};

function VisualMapCard({
  projectId,
  canvas,
  contextLabel,
  statusLabel,
  title,
  hotspotCountLabel,
}: VisualMapCardProps) {
  return (
    <Link
      className="portal-visual-map-card"
      href={`/portal/projects/${projectId}/visual-maps/${canvas.id}`}
    >
      <img
        src={canvas.imageUrl}
        alt={canvas.imageAlt ?? title}
        className="portal-visual-map-card__thumb"
      />
      <div className="portal-visual-map-card__body">
        <p className="portal-visual-map-card__title">{title}</p>
        <p className="portal-visual-map-card__meta">{contextLabel}</p>
        <div className="portal-visual-map-card__footer">
          <span className={STATUS_BADGE_CLASS[canvas.status]}>{statusLabel}</span>
          <span className="portal-visual-map-card__meta">{hotspotCountLabel}</span>
        </div>
      </div>
    </Link>
  );
}
