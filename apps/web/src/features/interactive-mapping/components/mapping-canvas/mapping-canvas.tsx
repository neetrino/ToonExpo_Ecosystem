'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { bandPolygonFromEdge, pointerToNormalized, type NormPoint } from '../../utils/mapping-math';
import { type PolygonShape } from '../../utils/curved-polygon';
import { getContainedImageBounds } from '../../utils/coordinates';
import { MappingCanvasStage } from './mapping-canvas-stage';
import { MappingCanvasToolbar } from './mapping-canvas-toolbar';
import { getMappingCanvasHintText } from './mapping-canvas-hints';
import {
  type EditorMode,
  type MappingBulkPathUpdate,
  type MappingCanvasHandle,
  type MappingCanvasProps,
  type MappingEntity,
} from './mapping-canvas.types';
import { useMappingCanvasCommits } from './use-mapping-canvas-commits';
import { useMappingCanvasInteractions } from './use-mapping-canvas-interactions';
import { useMappingCanvasKeyboard } from './use-mapping-canvas-keyboard';

export type { MappingBulkPathUpdate, MappingCanvasHandle, MappingEntity };

export const MappingCanvas = forwardRef<MappingCanvasHandle, MappingCanvasProps>(
  function MappingCanvas(
    {
      imageUrl,
      imageWidth,
      imageHeight,
      viewBoxWidth,
      viewBoxHeight,
      entities,
      selectedId,
      onSelect,
      onChangeEntity,
      onPolygonClosed,
      onPolygonDeleted,
      toolPreset = 'basic',
      viewportClassName,
      onBulkPaths,
    },
    ref,
  ) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<EditorMode>('select');
    const [draftPoints, setDraftPoints] = useState<NormPoint[]>([]);
    const [editShape, setEditShape] = useState<PolygonShape | null>(null);
    const [selectedDraftIndex, setSelectedDraftIndex] = useState<number | null>(null);
    const [bounds, setBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
    const draftRef = useRef(draftPoints);
    const editShapeRef = useRef<PolygonShape | null>(null);
    const selectedDraftIndexRef = useRef(selectedDraftIndex);
    const selectedIdRef = useRef(selectedId);
    const entitiesRef = useRef(entities);
    const modeRef = useRef(mode);
    const replaceOnCommitRef = useRef(false);
    const toolPresetRef = useRef(toolPreset);
    const [cursorPoint, setCursorPoint] = useState<NormPoint | null>(null);

    useEffect(() => {
      draftRef.current = draftPoints;
    }, [draftPoints]);
    useEffect(() => {
      editShapeRef.current = editShape;
    }, [editShape]);
    useEffect(() => {
      toolPresetRef.current = toolPreset;
    }, [toolPreset]);
    useEffect(() => {
      selectedDraftIndexRef.current = selectedDraftIndex;
    }, [selectedDraftIndex]);
    useEffect(() => {
      selectedIdRef.current = selectedId;
    }, [selectedId]);
    useEffect(() => {
      entitiesRef.current = entities;
    }, [entities]);
    useEffect(() => {
      modeRef.current = mode;
    }, [mode]);

    const measure = useCallback(() => {
      const el = viewportRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setBounds(
        getContainedImageBounds(
          { width: rect.width, height: rect.height },
          { width: imageWidth, height: imageHeight },
        ),
      );
    }, [imageHeight, imageWidth]);

    useEffect(() => {
      measure();
      const el = viewportRef.current;
      if (!el) return;
      const observer = new ResizeObserver(() => measure());
      observer.observe(el);
      return () => observer.disconnect();
    }, [measure]);

    const selected = entities.find((entity) => entity.id === selectedId) ?? null;
    const isDrawingMode =
      mode === 'draw-polygon' ||
      mode === 'edit-polygon' ||
      mode === 'draw-band' ||
      mode === 'auto-stack' ||
      mode === 'place-marker';

    const readNormalized = (
      event: { clientX: number; clientY: number },
      options?: { clamp?: boolean },
    ) => {
      const el = viewportRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return pointerToNormalized(
        { clientX: event.clientX, clientY: event.clientY },
        rect,
        { width: imageWidth, height: imageHeight },
        options,
      );
    };

    const {
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
    } = useMappingCanvasCommits({
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
    });

    useImperativeHandle(
      ref,
      () => ({
        flushPolygonDraft: () => {
          const entityId = selectedIdRef.current;
          if (!entityId) return null;
          const currentMode = modeRef.current;
          if (currentMode === 'draw-band') {
            return commitBand(draftRef.current, entityId);
          }
          if (currentMode === 'auto-stack') return null;
          if (currentMode === 'edit-polygon') {
            replaceOnCommitRef.current = true;
          }
          return commitDraft(draftRef.current, entityId);
        },
        hasOpenDraft: () => draftRef.current.length > 0,
        getDraftPointCount: () => draftRef.current.length,
      }),
      [commitBand, commitDraft],
    );

    useMappingCanvasKeyboard({
      modeRef,
      draftRef,
      selectedDraftIndexRef,
      replaceOnCommitRef,
      nudgeSelection,
      closePolygon,
      deleteSelectedDraftPoint,
      undoLastDraftPoint,
      clearDraft,
      setSelectedDraftIndex,
      setMode,
    });

    const {
      onCanvasClick,
      deletePolygon,
      startFreshPolygon,
      onMarkerPointerDown,
      onMarkerPointerMove,
      onMarkerPointerUp,
    } = useMappingCanvasInteractions({
      mode,
      selectedId,
      selected,
      draftRef,
      dragRef,
      replaceOnCommitRef,
      confirmDeletePolygon: tCanvas('confirmDeletePolygon'),
      confirmReplacePolygon: tCanvas('confirmReplacePolygon'),
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
    });

    const hintText = getMappingCanvasHintText({
      mode,
      entitiesCount: entities.length,
      selectedId,
      toolPreset,
      t: tCanvas,
    });

    const bandPreview =
      mode === 'draw-band' && draftPoints.length >= 3
        ? bandPolygonFromEdge(draftPoints[0]!, draftPoints[1]!, draftPoints[2]!)
        : null;

    return (
      <div className="space-y-3">
        <MappingCanvasToolbar
          mode={mode}
          toolPreset={toolPreset}
          selectedId={selectedId}
          selected={selected}
          draftPointsLength={draftPoints.length}
          selectedDraftIndex={selectedDraftIndex}
          viewBoxWidth={viewBoxWidth}
          viewBoxHeight={viewBoxHeight}
          changeMode={changeMode}
          resolveOpenDraft={resolveOpenDraft}
          replaceOnCommitRef={replaceOnCommitRef}
          setMode={setMode}
          setSelectedDraftIndex={setSelectedDraftIndex}
          replaceEditShape={replaceEditShape}
          startFreshPolygon={startFreshPolygon}
          deletePolygon={deletePolygon}
          closePolygon={closePolygon}
          deleteSelectedDraftPoint={deleteSelectedDraftPoint}
          undoLastDraftPoint={undoLastDraftPoint}
          clearDraft={clearDraft}
          draftPoints={draftPoints}
          modeIsDrawPolygon={mode === 'draw-polygon'}
          modeIsEditPolygon={mode === 'edit-polygon'}
          modeIsDrawBand={mode === 'draw-band'}
          modeIsAutoStack={mode === 'auto-stack'}
        />

        <MappingCanvasStage
          viewportRef={viewportRef}
          viewportClassName={viewportClassName}
          bounds={bounds}
          imageUrl={imageUrl}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
          viewBoxWidth={viewBoxWidth}
          viewBoxHeight={viewBoxHeight}
          entities={entities}
          selectedId={selectedId}
          mode={mode}
          draftPoints={draftPoints}
          editShape={editShape}
          cursorPoint={cursorPoint}
          bandPreview={bandPreview}
          isDrawingMode={isDrawingMode}
          onCanvasClick={onCanvasClick}
          readNormalized={readNormalized}
          replaceEditShape={replaceEditShape}
          onSelect={onSelect}
          onMarkerPointerDown={onMarkerPointerDown}
          onMarkerPointerMove={onMarkerPointerMove}
          onMarkerPointerUp={onMarkerPointerUp}
          setCursorPoint={setCursorPoint}
        />

        <p className="text-xs text-muted-foreground">{hintText}</p>
      </div>
    );
  },
);
