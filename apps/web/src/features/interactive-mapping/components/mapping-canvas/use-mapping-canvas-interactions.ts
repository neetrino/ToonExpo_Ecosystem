'use client';

import {
  useCallback,
  type Dispatch,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type SetStateAction,
} from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import type { NormPoint } from '../../utils/mapping-math';
import type { EditorMode, MappingEntity } from './mapping-canvas.types';

type UseMappingCanvasInteractionsParams = {
  mode: EditorMode;
  selectedId: string | null;
  selected: MappingEntity | null;
  draftRef: MutableRefObject<NormPoint[]>;
  dragRef: MutableRefObject<{ id: string } | null>;
  replaceOnCommitRef: MutableRefObject<boolean>;
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
    if (!window.confirm('Ջնջե՞լ այս գծագիրը։ Կարող ես հետո նոր polygon գծել։')) {
      return;
    }
    onChangeEntity(selectedId, { svgPath: null });
    onPolygonDeleted?.(selectedId);
    clearDraft();
    setMode('select');
  }, [clearDraft, onChangeEntity, onPolygonDeleted, selected, selectedId, setMode]);

  const startFreshPolygon = useCallback(() => {
    if (!selectedId) return;
    if (selected?.svgPath) {
      if (!window.confirm('Ջնջե՞լ հին գծագիրը և սկսել նորը։ Հինը կպահպանվի որպես ջնջված։')) {
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
    onChangeEntity,
    onPolygonDeleted,
    replaceOnCommitRef,
    selected,
    selectedId,
    setMode,
  ]);

  const onMarkerPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, id: string) => {
      event.stopPropagation();
      onSelect(id);
      dragRef.current = { id };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [dragRef, onSelect],
  );

  const onMarkerPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!dragRef.current) return;
      const point = readNormalized(event);
      if (!point) return;
      onChangeEntity(dragRef.current.id, {
        markerX: point.x,
        markerY: point.y,
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
