'use client';

import type { PortalVisualHotspotItem, VisualHotspotTargetType } from '@toonexpo/contracts';
import { useCallback, useMemo, useRef, useState } from 'react';

import {
  createAdminVisualHotspot,
  deleteAdminVisualHotspot,
  updateAdminVisualHotspot,
} from '../../api/interactive-mapping-api';
import {
  hotspotToMappingCoords,
  toCreateHotspotBody,
  toUpdateHotspotBody,
} from '../../utils/hotspot-geometry';
import {
  MappingCanvas,
  type MappingBulkPathUpdate,
  type MappingCanvasHandle,
  type MappingEntity,
} from '../mapping-canvas/mapping-canvas';
import { MappingEntitySidebar, type MappingEditorEntity } from './mapping-entity-sidebar';

export type { MappingEditorEntity };

export type MappingEditorShellProps = {
  companyId: string;
  canvasId: string;
  targetType: VisualHotspotTargetType;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
  initialEntities: MappingEditorEntity[];
  listTitle: string;
  toolPreset?: 'basic' | 'floors';
  onAfterSave?: (() => void) | undefined;
};

const mergeHotspot = (
  entity: MappingEditorEntity,
  hotspot: PortalVisualHotspotItem,
): MappingEditorEntity => ({
  ...entity,
  hotspotId: hotspot.id,
  ...hotspotToMappingCoords(hotspot),
  label: hotspot.label || entity.label,
});

/**
 * Shared MappingCanvas + entity list with Nest hotspot persistence.
 */
export const MappingEditorShell = ({
  companyId,
  canvasId,
  targetType,
  imageUrl,
  imageWidth,
  imageHeight,
  viewBoxWidth,
  viewBoxHeight,
  initialEntities,
  listTitle,
  toolPreset = 'basic',
  onAfterSave,
}: MappingEditorShellProps) => {
  const canvasRef = useRef<MappingCanvasHandle>(null);
  const entitiesRef = useRef(initialEntities);
  const [entities, setEntities] = useState(initialEntities);
  const [selectedId, setSelectedId] = useState<string | null>(initialEntities[0]?.id ?? null);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  entitiesRef.current = entities;

  const selected = useMemo(
    () => entities.find((item) => item.id === selectedId) ?? null,
    [entities, selectedId],
  );

  const persistEntity = useCallback(
    async (item: MappingEditorEntity, note: string) => {
      setPending(true);
      setMessage(null);
      try {
        const geometry = {
          markerX: item.markerX,
          markerY: item.markerY,
          svgPath: item.svgPath,
        };
        const hotspot = item.hotspotId
          ? await updateAdminVisualHotspot(
              companyId,
              canvasId,
              item.hotspotId,
              toUpdateHotspotBody(geometry, item.label),
            )
          : await createAdminVisualHotspot(
              companyId,
              canvasId,
              toCreateHotspotBody({
                targetType,
                targetId: item.id,
                label: item.label || item.title,
                geometry,
              }),
            );
        const merged = mergeHotspot(item, hotspot);
        setEntities((prev) => prev.map((row) => (row.id === item.id ? merged : row)));
        setDirtyIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
        setMessage(note);
        onAfterSave?.();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Save failed');
      } finally {
        setPending(false);
      }
    },
    [canvasId, companyId, onAfterSave, targetType],
  );

  const onChangeEntity = (
    id: string,
    patch: Partial<Pick<MappingEntity, 'markerX' | 'markerY' | 'svgPath'>>,
  ) => {
    setEntities((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    setDirtyIds((prev) => new Set(prev).add(id));
  };

  const onPolygonClosed = (id: string, svgPath: string) => {
    const current = entitiesRef.current.find((item) => item.id === id);
    if (!current) {
      return;
    }
    const next = { ...current, svgPath };
    setEntities((prev) => prev.map((item) => (item.id === id ? next : item)));
    void persistEntity(next, 'Saved');
  };

  const onPolygonDeleted = (id: string) => {
    const current = entitiesRef.current.find((item) => item.id === id);
    if (!current) {
      return;
    }
    const next = { ...current, svgPath: null };
    setEntities((prev) => prev.map((item) => (item.id === id ? next : item)));
    void persistEntity(next, 'Polygon cleared');
  };

  const onBulkPaths = (updates: MappingBulkPathUpdate[]) => {
    const byId = new Map(updates.map((item) => [item.id, item]));
    const nextEntities = entitiesRef.current.map((item) => {
      const update = byId.get(item.id);
      if (!update) {
        return item;
      }
      return {
        ...item,
        svgPath: update.svgPath,
        markerX: update.markerX,
        markerY: update.markerY,
      };
    });
    setEntities(nextEntities);
    setDirtyIds(new Set());
    void (async () => {
      setPending(true);
      try {
        for (const item of nextEntities) {
          if (byId.has(item.id)) {
            await persistEntity(item, '');
          }
        }
        setMessage(`Saved ${updates.length}`);
        onAfterSave?.();
      } finally {
        setPending(false);
      }
    })();
  };

  const onSave = async () => {
    if (!selected) {
      return;
    }
    if (canvasRef.current?.hasOpenDraft()) {
      const flushed = canvasRef.current.flushPolygonDraft();
      if (flushed) {
        return;
      }
      setMessage('Draw at least one point first');
      return;
    }
    const latest = entitiesRef.current.find((item) => item.id === selected.id) ?? selected;
    await persistEntity(latest, 'Saved');
  };

  const onClear = async () => {
    if (!selected?.hotspotId || !window.confirm('Remove mapping for this entity?')) {
      return;
    }
    setPending(true);
    try {
      await deleteAdminVisualHotspot(companyId, canvasId, selected.hotspotId);
      const cleared = {
        ...selected,
        hotspotId: null,
        markerX: null,
        markerY: null,
        svgPath: null,
      };
      setEntities((prev) => prev.map((item) => (item.id === selected.id ? cleared : item)));
      setMessage('Cleared');
      onAfterSave?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <MappingEntitySidebar
        listTitle={listTitle}
        entities={entities}
        selectedId={selectedId}
        dirtyIds={dirtyIds}
        pending={pending}
        message={message}
        onSelect={setSelectedId}
        onLabelChange={(id, label) => {
          setEntities((prev) => prev.map((item) => (item.id === id ? { ...item, label } : item)));
          setDirtyIds((prev) => new Set(prev).add(id));
        }}
        onSave={() => {
          void onSave();
        }}
        onClear={() => {
          void onClear();
        }}
      />
      <MappingCanvas
        ref={canvasRef}
        toolPreset={toolPreset}
        imageUrl={imageUrl}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        viewBoxWidth={viewBoxWidth}
        viewBoxHeight={viewBoxHeight}
        entities={entities}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onChangeEntity={onChangeEntity}
        onPolygonClosed={onPolygonClosed}
        onPolygonDeleted={onPolygonDeleted}
        {...(toolPreset === 'floors' ? { onBulkPaths } : {})}
      />
    </div>
  );
};
