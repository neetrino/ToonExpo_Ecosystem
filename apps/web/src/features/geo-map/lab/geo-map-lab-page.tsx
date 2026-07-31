'use client';

import { useState } from 'react';

import { GeoMapCanvasLazy } from '@/features/geo-map/components/geo-map-canvas-lazy';
import { GEO_MAP_LAB_OBJECTS } from '@/features/geo-map/lab/geo-map-lab-objects';
import type { GeoMapLngLat, GeoMapObject } from '@/features/geo-map/types';

const applyDrag = (objects: GeoMapObject[], id: string, position: GeoMapLngLat): GeoMapObject[] =>
  objects.map((object) =>
    object.id === id
      ? { ...object, longitude: position.longitude, latitude: position.latitude }
      : object,
  );

/**
 * Temporary `GeoMapCanvas` sandbox for headed QA (Stage 2a only).
 * Stage 2b builds the real admin editor at `/admin/geo-map`.
 */
export const GeoMapLabPage = () => {
  const [objects, setObjects] = useState(GEO_MAP_LAB_OBJECTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">QA</p>
        <h1 className="font-display text-3xl text-ink">3D map lab</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Sandbox with 3 hardcoded sample objects (Khronos glTF samples). Zoom in past the marker
          threshold (zoom {GEO_MAP_LAB_OBJECTS[0]?.minZoom}) to see the GLB models load; drag a
          marker or model to test <code>editable</code>. Stage 2b builds the real admin editor.
        </p>
      </div>

      <div className="h-[70vh] w-full overflow-hidden rounded-md border border-border">
        <GeoMapCanvasLazy
          objects={objects}
          editable
          onObjectClick={setSelectedId}
          onObjectHover={setHoveredId}
          onObjectDragged={(id, position) => setObjects((prev) => applyDrag(prev, id, position))}
        />
      </div>

      <p className="text-xs text-ink-secondary">
        Selected: {selectedId ?? '—'} · Hovered: {hoveredId ?? '—'}
      </p>
    </div>
  );
};
