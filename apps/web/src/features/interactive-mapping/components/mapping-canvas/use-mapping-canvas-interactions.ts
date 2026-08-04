'use client';

import {
  useCallback,
  type Dispatch,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type SetStateAction,
} from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { clampNormalized } from '../../utils/coordinates';
import type { NormPoint } from '../../utils/mapping-math';
import type { EditorMode, MappingEntity } from './mapping-canvas.types';

type MarkerDragState = {
  id: string;
  /** Cursor − marker center at pointer-down — keeps the grab point stable. */
  offsetX: number;
  offsetY: number;
};

type UseMappingCanvasInteractionsParams = {
  mode: EditorMode;
  selectedId: string | null;
  selected: MappingEntity | null;
  draftRef: MutableRefObject<NormPoint[]>;
  dragRef: MutableRefObject<MarkerDragState | null>;
  replaceOnCommitRef: MutableRefObject<boolean>;
  confirmDeletePolygon: string;
  confirmReplacePolygon: string;
  readNormalized: (
    event: { clientX: number; clientY: number },
    options?: { clamp?: boolean },
  ) => NormPoint | null;
  onSelect: (id: string) => void;
  onChangeEntity: (
    id: string,
    patch: Partial<Pick<MappingEntity, 'markerX' | 'markerY' | 'svgPath'>>,
  ) => void;
  onPolygonDeleted?: ((id: string) => void) | undefined;
  updateDraftPoints: (updater: (prev: NormPoint[]) => NormPoint[]) => void;
  commitAutoStack: (points: NormPoint[]) => boolean;
  commitBand: (points: NormPoint[], entityId: string) => string | null;
  clearDraft: () => void;
  setMode: (mode: EditorMode) => void;
  setSelectedDraftIndex: Dispatch<SetStateAction<number | null>>;
};

export const useMappingCanvasInteractions = ({
  mode,
  selectedId,
  selected,
  confirmDeletePolygon,
  confirmReplacePolygon,
  draftRef,
  dragRef,
  replaceOnCommitRef,
  readNormalized,
  onSelect,
  onChangeEntity,
  onPolygonDeleted,
  updateDraftPoints,
  commitAutoStack,
  commitBand,
  clearDraft,
  setMode,
  setSelectedDraftIndex,
}: UseMappingCanvasInteractionsParams) => {
  const onCanvasClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (dragRef.current) return;
      const point = readNormalized(event);
      if (!point) return;

      if (mode === 'auto-stack') {
        updateDraftPoints((prev) => {
          const next = [...prev, point];
          if (next.length >= 4) {
            queueMicrotask(() => {
              commitAutoStack(next.slice(0, 4));
            });
            return next.slice(0, 4);
          }
          return next;
        });
        return;
      }

      if (!selectedId) return;

      if (mode === 'place-marker') {
        onChangeEntity(selectedId, { markerX: point.x, markerY: point.y });
        return;
      }

      if (mode === 'draw-band') {
        updateDraftPoints((prev) => {
          const next = [...prev, point];
          if (next.length >= 3) {
            const entityId = selectedId;
            queueMicrotask(() => {
              commitBand(next.slice(0, 3), entityId);
            });
            return next.slice(0, 3);
          }
          return next;
        });
        return;
      }

      if (mode === 'draw-polygon') {
        if (event.altKey) {
          const threshold = 0.02;
          const nearIndex = draftRef.current.findIndex(
            (existing) => Math.hypot(existing.x - point.x, existing.y - point.y) <= threshold,
          );
          if (nearIndex >= 0) {
            setSelectedDraftIndex((current) => (current === nearIndex ? null : nearIndex));
            return;
          }
        }
        setSelectedDraftIndex(null);
        updateDraftPoints((prev) => [...prev, point]);
      }
    },
    [
      commitAutoStack,
      commitBand,
      draftRef,
      dragRef,
      mode,
      onChangeEntity,
      readNormalized,
      selectedId,
      setSelectedDraftIndex,
      updateDraftPoints,
    ],
  );

  const deletePolygon = useCallback(() => {
    if (!selectedId || !selected?.svgPath) return;
    if (!window.confirm(confirmDeletePolygon)) {
      return;
    }
    onChangeEntity(selectedId, { svgPath: null });
    onPolygonDeleted?.(selectedId);
    clearDraft();
    setMode('select');
  }, [
    clearDraft,
    confirmDeletePolygon,
    onChangeEntity,
    onPolygonDeleted,
    selected,
    selectedId,
    setMode,
  ]);

  const startFreshPolygon = useCallback(() => {
    if (!selectedId) return;
    if (selected?.svgPath) {
      if (!window.confirm(confirmReplacePolygon)) {
        return;
      }
      onChangeEntity(selectedId, { svgPath: null });
      onPolygonDeleted?.(selectedId);
    }
    replaceOnCommitRef.current = false;
    clearDraft();
    setMode('draw-polygon');
  }, [
    clearDraft,
    confirmReplacePolygon,
    onChangeEntity,
    onPolygonDeleted,
    replaceOnCommitRef,
    selected,
    selectedId,
    setMode,
  ]);

  const onMarkerPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, id: string, markerX: number, markerY: number) => {
      event.stopPropagation();
      event.preventDefault();
      onSelect(id);
      const point = readNormalized(event);
      if (!point) {
        return;
      }
      dragRef.current = {
        id,
        offsetX: point.x - markerX,
        offsetY: point.y - markerY,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [dragRef, onSelect, readNormalized],
  );

  const onMarkerPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      const point = readNormalized(event);
      if (!point) return;
      onChangeEntity(drag.id, {
        markerX: clampNormalized(point.x - drag.offsetX),
        markerY: clampNormalized(point.y - drag.offsetY),
      });
    },
    [dragRef, onChangeEntity, readNormalized],
  );

  const onMarkerPointerUp = useCallback(() => {
    dragRef.current = null;
  }, [dragRef]);

  return {
    onCanvasClick,
    deletePolygon,
    startFreshPolygon,
    onMarkerPointerDown,
    onMarkerPointerMove,
    onMarkerPointerUp,
  };
};
