'use client';

import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';
import type { NormPoint } from '../../utils/mapping-math';
import { polygonShapeToSvgPath, type PolygonShape } from '../../utils/curved-polygon';
import { formatMarkerLabel } from '../../utils/format-marker-label';
import { PolygonEditHandles } from './polygon-edit-handles';
import type { EditorMode, MappingEntity } from './mapping-canvas.types';

type ImageBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type MappingCanvasStageProps = {
  viewportRef: RefObject<HTMLDivElement | null>;
  viewportClassName?: string | undefined;
  bounds: ImageBounds;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
  entities: MappingEntity[];
  selectedId: string | null;
  mode: EditorMode;
  draftPoints: NormPoint[];
  editShape: PolygonShape | null;
  cursorPoint: NormPoint | null;
  bandPreview: NormPoint[] | null;
  isDrawingMode: boolean;
  onCanvasClick: (event: ReactMouseEvent<HTMLDivElement>) => void;
  readNormalized: (
    event: { clientX: number; clientY: number },
    options?: { clamp?: boolean },
  ) => NormPoint | null;
  replaceEditShape: (shape: PolygonShape) => void;
  onSelect: (id: string) => void;
  onMarkerPointerDown: (
    event: ReactPointerEvent<HTMLButtonElement>,
    id: string,
    markerX: number,
    markerY: number,
  ) => void;
  onMarkerPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onMarkerPointerUp: () => void;
  setCursorPoint: (point: NormPoint | null) => void;
};

export const MappingCanvasStage = ({
  viewportRef,
  viewportClassName,
  bounds,
  imageUrl,
  imageWidth,
  imageHeight,
  viewBoxWidth,
  viewBoxHeight,
  entities,
  selectedId,
  mode,
  draftPoints,
  editShape,
  cursorPoint,
  bandPreview,
  isDrawingMode,
  onCanvasClick,
  readNormalized,
  replaceEditShape,
  onSelect,
  onMarkerPointerDown,
  onMarkerPointerMove,
  onMarkerPointerUp,
  setCursorPoint,
}: MappingCanvasStageProps) => {
  return (
    <div
      ref={viewportRef}
      className={
        viewportClassName ??
        'relative h-[min(70dvh,720px)] w-full cursor-crosshair touch-none select-none overflow-hidden border border-border bg-[hsl(var(--muted))]'
      }
      onClick={onCanvasClick}
      onDragStart={(event) => event.preventDefault()}
      onPointerMove={(event) => {
        if (mode !== 'draw-polygon' && mode !== 'draw-band' && mode !== 'auto-stack') {
          if (cursorPoint) setCursorPoint(null);
          return;
        }
        const point = readNormalized(event, { clamp: true });
        setCursorPoint(point);
      }}
      onPointerLeave={() => setCursorPoint(null)}
    >
      <div
        className="absolute select-none"
        style={{
          left: bounds.x,
          top: bounds.y,
          width: bounds.width,
          height: bounds.height,
        }}
        onDragStart={(event) => event.preventDefault()}
      >
        <img
          src={imageUrl}
          alt="Mapping canvas"
          width={imageWidth}
          height={imageHeight}
          draggable={false}
          onDragStart={(event) => event.preventDefault()}
          className="pointer-events-none h-full w-full object-fill select-none [-webkit-user-drag:none]"
        />
        <div
          aria-hidden
          className="absolute inset-0 z-[1]"
          onDragStart={(event) => event.preventDefault()}
        />
        <svg
          className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          preserveAspectRatio="none"
        >
          {entities.map((entity) =>
            entity.svgPath && !(mode === 'edit-polygon' && entity.id === selectedId) ? (
              <path
                key={`poly-${entity.id}`}
                d={entity.svgPath}
                fill={entity.id === selectedId ? 'rgba(232,140,72,0.32)' : 'rgba(232,140,72,0.16)'}
                stroke={entity.id === selectedId ? '#c45c26' : '#d4894a'}
                strokeWidth={entity.id === selectedId ? 3 : 1.5}
              />
            ) : null,
          )}
          {draftPoints.length > 0 ? (
            mode === 'edit-polygon' && editShape ? (
              <path
                d={polygonShapeToSvgPath(editShape, viewBoxWidth, viewBoxHeight)}
                fill="rgba(232,140,72,0.28)"
                stroke="#c45c26"
                strokeWidth="3"
              />
            ) : (
              <polyline
                points={draftPoints
                  .map((point) => `${point.x * viewBoxWidth},${point.y * viewBoxHeight}`)
                  .join(' ')}
                fill="none"
                stroke="#c45c26"
                strokeWidth="3"
                strokeDasharray="8 6"
              />
            )
          ) : null}
          {cursorPoint &&
          draftPoints.length > 0 &&
          (mode === 'draw-polygon' || mode === 'draw-band' || mode === 'auto-stack') ? (
            <line
              x1={draftPoints[draftPoints.length - 1]!.x * viewBoxWidth}
              y1={draftPoints[draftPoints.length - 1]!.y * viewBoxHeight}
              x2={cursorPoint.x * viewBoxWidth}
              y2={cursorPoint.y * viewBoxHeight}
              stroke="#c45c26"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.9"
            />
          ) : null}
          {bandPreview ? (
            <polygon
              points={bandPreview
                .map((point) => `${point.x * viewBoxWidth},${point.y * viewBoxHeight}`)
                .join(' ')}
              fill="rgba(232,140,72,0.25)"
              stroke="#c45c26"
              strokeWidth="2"
            />
          ) : null}
        </svg>

        {mode === 'edit-polygon' && editShape && editShape.vertices.length > 0 ? (
          <PolygonEditHandles
            shape={editShape}
            onChangeShape={replaceEditShape}
            readNormalized={(event) => readNormalized(event, { clamp: false })}
          />
        ) : null}

        {entities.map((entity) => {
          const markerX = entity.markerX;
          const markerY = entity.markerY;
          if (markerX == null || markerY == null) {
            return null;
          }
          if (mode === 'edit-polygon' && entity.id !== selectedId) {
            return null;
          }
          const editingSelected = mode === 'edit-polygon' && entity.id === selectedId;
          const markerLabel = formatMarkerLabel(entity.label);
          const compactMarker = markerLabel.length <= 2;
          return (
            <button
              key={`marker-${entity.id}`}
              type="button"
              className={`map-editor-marker absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing ${
                compactMarker ? 'map-editor-marker--compact' : 'map-editor-marker--pill'
              } ${editingSelected ? 'map-editor-marker--editing' : ''} ${
                isDrawingMode ? 'pointer-events-none' : ''
              } ${entity.id === selectedId ? 'map-editor-marker--selected' : ''}`}
              style={{
                left: `${markerX * 100}%`,
                top: `${markerY * 100}%`,
              }}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(entity.id);
              }}
              onPointerDown={(event) => onMarkerPointerDown(event, entity.id, markerX, markerY)}
              onPointerMove={onMarkerPointerMove}
              onPointerUp={onMarkerPointerUp}
            >
              {markerLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
};
