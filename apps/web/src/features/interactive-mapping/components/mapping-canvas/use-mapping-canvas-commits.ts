'use client';

import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import {
  appendSvgPaths,
  bandPolygonFromEdge,
  normalizedPointsToSvgPath,
  offsetNormalizedPath,
  pathCentroid,
  stackBandsFromQuad,
  type NormPoint,
} from '../../utils/mapping-math';
import { polygonShapeToSvgPath, type PolygonShape } from '../../utils/curved-polygon';
import { clampNormalized } from '../../utils/coordinates';
import type { EditorMode, MappingBulkPathUpdate, MappingEntity } from './mapping-canvas.types';

type UseMappingCanvasCommitsParams = {
  viewBoxWidth: number;
  viewBoxHeight: number;
  onChangeEntity: (
    id: string,
    patch: Partial<Pick<MappingEntity, 'markerX' | 'markerY' | 'svgPath'>>,
  ) => void;
  onPolygonClosed?: ((id: string, svgPath: string) => void) | undefined;
  onBulkPaths?: ((updates: MappingBulkPathUpdate[]) => void) | undefined;
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  setDraftPoints: Dispatch<SetStateAction<NormPoint[]>>;
  setEditShape: Dispatch<SetStateAction<PolygonShape | null>>;
  setSelectedDraftIndex: Dispatch<SetStateAction<number | null>>;
  draftRef: MutableRefObject<NormPoint[]>;
  editShapeRef: MutableRefObject<PolygonShape | null>;
  selectedIdRef: MutableRefObject<string | null>;
  selectedDraftIndexRef: MutableRefObject<number | null>;
  entitiesRef: MutableRefObject<MappingEntity[]>;
  modeRef: MutableRefObject<EditorMode>;
  replaceOnCommitRef: MutableRefObject<boolean>;
  toolPresetRef: MutableRefObject<'basic' | 'floors'>;
};

export const useMappingCanvasCommits = ({
  viewBoxWidth,
  viewBoxHeight,
  onChangeEntity,
  onPolygonClosed,
  onBulkPaths,
  mode,
  setMode,
  setDraftPoints,
  setEditShape,
  setSelectedDraftIndex,
  draftRef,
  editShapeRef,
  selectedIdRef,
  selectedDraftIndexRef,
  entitiesRef,
  modeRef,
  replaceOnCommitRef,
  toolPresetRef,
}: UseMappingCanvasCommitsParams) => {
  const commitDraft = useCallback(
    (points: NormPoint[], entityId: string) => {
      const editing = modeRef.current === 'edit-polygon';
      const shaped = editShapeRef.current;
      const vertexCount =
        editing && shaped && shaped.vertices.length > 0 ? shaped.vertices.length : points.length;
      // Public hover uses SVG fill hit-testing — need a closed polygon (≥3 points).
      if (vertexCount < 3) return null;

      const nextSegment =
        editing && shaped && shaped.vertices.length > 0
          ? polygonShapeToSvgPath(shaped, viewBoxWidth, viewBoxHeight)
          : normalizedPointsToSvgPath(points, viewBoxWidth, viewBoxHeight);
      if (!nextSegment) return null;

      const existing =
        entitiesRef.current.find((entity) => entity.id === entityId)?.svgPath ?? null;
      const shouldReplace =
        replaceOnCommitRef.current || editing || toolPresetRef.current === 'floors' || !existing;
      const svgPath = shouldReplace ? nextSegment : appendSvgPaths(existing, nextSegment);
      replaceOnCommitRef.current = false;

      const centroid = pathCentroid(editing && shaped ? shaped.vertices : points);
      onChangeEntity(entityId, {
        svgPath,
        markerX: centroid.x,
        markerY: centroid.y,
      });
      onPolygonClosed?.(entityId, svgPath);
      draftRef.current = [];
      editShapeRef.current = null;
      setDraftPoints([]);
      setEditShape(null);
      setSelectedDraftIndex(null);
      setMode(editing ? 'select' : 'draw-polygon');
      return svgPath;
    },
    [
      draftRef,
      editShapeRef,
      entitiesRef,
      modeRef,
      onChangeEntity,
      onPolygonClosed,
      replaceOnCommitRef,
      setDraftPoints,
      setEditShape,
      setMode,
      setSelectedDraftIndex,
      toolPresetRef,
      viewBoxHeight,
      viewBoxWidth,
    ],
  );

  const commitBand = useCallback(
    (points: NormPoint[], entityId: string) => {
      if (points.length < 3) return null;
      const band = bandPolygonFromEdge(points[0]!, points[1]!, points[2]!);
      replaceOnCommitRef.current = true;
      const svgPath = normalizedPointsToSvgPath(band, viewBoxWidth, viewBoxHeight);
      if (!svgPath) return null;
      const centroid = pathCentroid(band);
      onChangeEntity(entityId, {
        svgPath,
        markerX: centroid.x,
        markerY: centroid.y,
      });
      onPolygonClosed?.(entityId, svgPath);
      draftRef.current = [];
      setDraftPoints([]);
      setSelectedDraftIndex(null);
      setMode('draw-band');
      return svgPath;
    },
    [
      draftRef,
      onChangeEntity,
      onPolygonClosed,
      replaceOnCommitRef,
      setDraftPoints,
      setMode,
      setSelectedDraftIndex,
      viewBoxHeight,
      viewBoxWidth,
    ],
  );

  const commitAutoStack = useCallback(
    (points: NormPoint[]) => {
      if (points.length < 4 || !onBulkPaths) return false;
      const list = entitiesRef.current;
      if (list.length === 0) return false;
      const bands = stackBandsFromQuad(points[0]!, points[1]!, points[2]!, points[3]!, list.length);
      const updates: MappingBulkPathUpdate[] = list.map((entity, index) => {
        const band = bands[list.length - 1 - index] ?? bands[0]!;
        const svgPath = normalizedPointsToSvgPath(band, viewBoxWidth, viewBoxHeight);
        const centroid = pathCentroid(band);
        return {
          id: entity.id,
          svgPath,
          markerX: centroid.x,
          markerY: centroid.y,
        };
      });
      onBulkPaths(updates);
      draftRef.current = [];
      setDraftPoints([]);
      setSelectedDraftIndex(null);
      setMode('select');
      return true;
    },
    [
      draftRef,
      entitiesRef,
      onBulkPaths,
      setDraftPoints,
      setMode,
      setSelectedDraftIndex,
      viewBoxHeight,
      viewBoxWidth,
    ],
  );

  const clearDraft = useCallback(() => {
    draftRef.current = [];
    editShapeRef.current = null;
    setDraftPoints([]);
    setEditShape(null);
    setSelectedDraftIndex(null);
  }, [draftRef, editShapeRef, setDraftPoints, setEditShape, setSelectedDraftIndex]);

  const closePolygon = useCallback(() => {
    const entityId = selectedIdRef.current;
    if (!entityId) return;
    const points = draftRef.current;
    if (points.length < 3) return;
    commitDraft(points, entityId);
  }, [commitDraft, draftRef, selectedIdRef]);

  const replaceEditShape = useCallback(
    (next: PolygonShape) => {
      editShapeRef.current = next;
      setEditShape(next);
      draftRef.current = next.vertices;
      setDraftPoints(next.vertices);
    },
    [draftRef, editShapeRef, setDraftPoints, setEditShape],
  );

  const updateDraftPoints = useCallback(
    (updater: (prev: NormPoint[]) => NormPoint[]) => {
      setDraftPoints((prev) => {
        const next = updater(prev);
        draftRef.current = next;
        return next;
      });
    },
    [draftRef, setDraftPoints],
  );

  const deleteSelectedDraftPoint = useCallback(() => {
    const index = selectedDraftIndexRef.current;
    if (index == null) return;
    updateDraftPoints((prev) => prev.filter((_, i) => i !== index));
    setSelectedDraftIndex(null);
  }, [selectedDraftIndexRef, setSelectedDraftIndex, updateDraftPoints]);

  const undoLastDraftPoint = useCallback(() => {
    updateDraftPoints((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice(0, -1);
      setSelectedDraftIndex((current) => {
        if (current == null) return null;
        if (current >= next.length) return null;
        return current;
      });
      return next;
    });
  }, [setSelectedDraftIndex, updateDraftPoints]);

  const discardGuideDraft = useCallback(() => {
    clearDraft();
    return true;
  }, [clearDraft]);

  const resolveOpenDraft = useCallback(() => {
    const draft = draftRef.current;
    if (draft.length === 0) return true;
    const currentMode = modeRef.current;
    if (currentMode === 'draw-band' || currentMode === 'auto-stack') {
      return discardGuideDraft();
    }
    const entityId = selectedIdRef.current;
    if (!entityId) return false;
    if (currentMode === 'edit-polygon') {
      replaceOnCommitRef.current = true;
    }
    return commitDraft(draft, entityId) != null;
  }, [commitDraft, discardGuideDraft, draftRef, modeRef, replaceOnCommitRef, selectedIdRef]);

  const changeMode = useCallback(
    (next: EditorMode) => {
      if (next === mode) return;
      if (!resolveOpenDraft()) return;
      setMode(next);
      if (
        next === 'draw-polygon' ||
        next === 'edit-polygon' ||
        next === 'draw-band' ||
        next === 'auto-stack'
      ) {
        replaceOnCommitRef.current = next === 'edit-polygon';
        if (next !== 'edit-polygon') clearDraft();
      }
    },
    [clearDraft, mode, replaceOnCommitRef, resolveOpenDraft, setMode],
  );

  const nudgeSelection = useCallback(
    (dx: number, dy: number) => {
      if (draftRef.current.length > 0) {
        updateDraftPoints((prev) =>
          prev.map((point) => ({
            x: clampNormalized(point.x + dx),
            y: clampNormalized(point.y + dy),
          })),
        );
        return;
      }
      const entityId = selectedIdRef.current;
      if (!entityId) return;
      const entity = entitiesRef.current.find((item) => item.id === entityId);
      if (!entity?.svgPath) return;
      const svgPath = offsetNormalizedPath(entity.svgPath, dx, dy, viewBoxWidth, viewBoxHeight);
      onChangeEntity(entityId, {
        svgPath,
        markerX: entity.markerX == null ? null : clampNormalized(entity.markerX + dx),
        markerY: entity.markerY == null ? null : clampNormalized(entity.markerY + dy),
      });
    },
    [
      draftRef,
      entitiesRef,
      onChangeEntity,
      selectedIdRef,
      updateDraftPoints,
      viewBoxHeight,
      viewBoxWidth,
    ],
  );

  return {
    commitDraft,
    commitBand,
    commitAutoStack,
    closePolygon,
    clearDraft,
    replaceEditShape,
    updateDraftPoints,
    deleteSelectedDraftPoint,
    undoLastDraftPoint,
    resolveOpenDraft,
    changeMode,
    nudgeSelection,
  };
};
