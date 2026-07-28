'use client';

import type { PortalVisualHotspotItem, VisualHotspotTargetType } from '@toonexpo/contracts';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createAdminVisualHotspot,
  deleteAdminVisualHotspot,
  updateAdminVisualHotspot,
} from '../api/interactive-mapping-api';
import {
  hotspotToMappingCoords,
  toCreateHotspotBody,
  toUpdateHotspotBody,
} from '../utils/hotspot-geometry';
import type {
  MappingBulkPathUpdate,
  MappingEntity,
} from '../components/mapping-canvas/mapping-canvas';
import type { MappingEditorEntity } from '../components/editors/mapping-entity-sidebar';

const mergeHotspot = (
  entity: MappingEditorEntity,
  hotspot: PortalVisualHotspotItem,
): MappingEditorEntity => ({
  ...entity,
  hotspotId: hotspot.id,
  ...hotspotToMappingCoords(hotspot),
  label: hotspot.label || entity.label,
});

type UseMappingEditorStateArgs = {
  companyId: string;
  canvasId: string;
  targetType: VisualHotspotTargetType;
  initialEntities: MappingEditorEntity[];
  onAfterSave?: (() => void) | undefined;
};

/**
 * Entity list + Nest hotspot persistence for MappingEditorShell.
 */
export const useMappingEditorState = ({
  companyId,
  canvasId,
  targetType,
  initialEntities,
  onAfterSave,
}: UseMappingEditorStateArgs) => {
  const entitiesRef = useRef(initialEntities);
  const dirtyIdsRef = useRef(new Set<string>());
  const [entities, setEntities] = useState(initialEntities);
  const [selectedId, setSelectedId] = useState<string | null>(initialEntities[0]?.id ?? null);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  entitiesRef.current = entities;
  dirtyIdsRef.current = dirtyIds;

  useEffect(() => {
    setEntities((prev) => {
      const prevById = new Map(prev.map((item) => [item.id, item]));
      const dirty = dirtyIdsRef.current;
      return initialEntities.map((incoming) => {
        const existing = prevById.get(incoming.id);
        if (!existing || !dirty.has(incoming.id)) {
          return incoming;
        }
        return {
          ...incoming,
          markerX: existing.markerX,
          markerY: existing.markerY,
          svgPath: existing.svgPath,
          label: existing.label,
          hotspotId: existing.hotspotId ?? incoming.hotspotId,
        };
      });
    });
    setSelectedId((current) => {
      if (current && initialEntities.some((item) => item.id === current)) {
        return current;
      }
      return initialEntities[0]?.id ?? null;
    });
    setDirtyIds((prev) => {
      const validIds = new Set(initialEntities.map((item) => item.id));
      const next = new Set([...prev].filter((id) => validIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [initialEntities]);

  const selected = entities.find((item) => item.id === selectedId) ?? null;

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

  const onSave = async (flushDraft: () => string | null, hasOpenDraft: () => boolean) => {
    if (!selected) {
      return;
    }
    if (hasOpenDraft()) {
      const flushed = flushDraft();
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

  const onLabelChange = (id: string, label: string) => {
    setEntities((prev) => prev.map((item) => (item.id === id ? { ...item, label } : item)));
    setDirtyIds((prev) => new Set(prev).add(id));
  };

  return {
    entities,
    selectedId,
    setSelectedId,
    dirtyIds,
    pending,
    message,
    onChangeEntity,
    onPolygonClosed,
    onPolygonDeleted,
    onBulkPaths,
    onSave,
    onClear,
    onLabelChange,
  };
};
