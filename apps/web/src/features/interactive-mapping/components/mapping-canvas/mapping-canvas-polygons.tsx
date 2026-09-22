'use client';

import type { MouseEvent as ReactMouseEvent } from 'react';

import { activeSvgSubpathIndex, splitSvgSubpaths } from '../../utils/mapping-math';
import type { EditorMode, MappingEntity } from './mapping-canvas.types';

const FILL_IDLE = 'rgba(232,140,72,0.16)';
const FILL_ACTIVE = 'rgba(232,140,72,0.32)';
const STROKE_IDLE = '#d4894a';
const STROKE_ACTIVE = '#c45c26';
const STROKE_IDLE_WIDTH = 1.5;
const STROKE_ACTIVE_WIDTH = 3;

type MappingCanvasPolygonsProps = {
  entities: MappingEntity[];
  selectedId: string | null;
  selectedSubpathIndex: number | null;
  mode: EditorMode;
  onSelectSubpath: (id: string, index: number) => void;
};

export const MappingCanvasPolygons = ({
  entities,
  selectedId,
  selectedSubpathIndex,
  mode,
  onSelectSubpath,
}: MappingCanvasPolygonsProps) => {
  const canPick = mode === 'select';

  const onPolygonClick = (
    event: ReactMouseEvent<SVGPathElement>,
    id: string,
    index: number,
  ): void => {
    if (!canPick) return;
    event.stopPropagation();
    onSelectSubpath(id, index);
  };

  return (
    <>
      {entities.map((entity) => {
        if (!entity.svgPath) return null;
        const subpaths = splitSvgSubpaths(entity.svgPath);
        const activeIndex = activeSvgSubpathIndex(entity.svgPath, selectedSubpathIndex);
        return subpaths.map((subpath, index) => {
          const hidden =
            mode === 'edit-polygon' && entity.id === selectedId && index === activeIndex;
          if (hidden) return null;
          const emphasized = entity.id === selectedId && index === activeIndex;
          return (
            <path
              key={`poly-${entity.id}-${index}`}
              d={subpath}
              className={canPick ? 'pointer-events-auto cursor-pointer' : undefined}
              fill={emphasized ? FILL_ACTIVE : FILL_IDLE}
              stroke={emphasized ? STROKE_ACTIVE : STROKE_IDLE}
              strokeWidth={emphasized ? STROKE_ACTIVE_WIDTH : STROKE_IDLE_WIDTH}
              onClick={(event) => {
                onPolygonClick(event, entity.id, index);
              }}
            />
          );
        });
      })}
    </>
  );
};
