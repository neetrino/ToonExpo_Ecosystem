'use client';

import { resolvePolygonLabelPoint } from '@/features/visual-map/utils/resolve-polygon-label-point';

export type PolygonHotspotOverlayItem = {
  id: string;
  label: string;
  svgPath: string;
  xPercent?: string | number;
  yPercent?: string | number;
  selected?: boolean;
};

type PolygonHotspotOverlayProps = {
  items: PolygonHotspotOverlayItem[];
  viewBoxWidth: number;
  viewBoxHeight: number;
  interactive?: boolean;
  onSelect?: (id: string) => void;
};

const LABEL_RADIUS_RATIO = 0.018;
const LABEL_FONT_RATIO = 0.024;
const LABEL_SIZE_MIN = 10;
const LABEL_SIZE_MAX = 22;

/**
 * SVG overlay for published polygon hotspots (Admin viewBox pixel `d` paths).
 * Fill + labels stay hidden until hover/focus (same contract as Phase 1–2).
 */
export const PolygonHotspotOverlay = ({
  items,
  viewBoxWidth,
  viewBoxHeight,
  interactive = false,
  onSelect,
}: PolygonHotspotOverlayProps) => {
  if (items.length === 0 || viewBoxWidth <= 0 || viewBoxHeight <= 0) {
    return null;
  }

  const minSide = Math.min(viewBoxWidth, viewBoxHeight);
  const labelRadius = Math.min(
    LABEL_SIZE_MAX,
    Math.max(LABEL_SIZE_MIN, minSide * LABEL_RADIUS_RATIO),
  );
  const labelFontSize = Math.min(
    LABEL_SIZE_MAX,
    Math.max(LABEL_SIZE_MIN, minSide * LABEL_FONT_RATIO),
  );

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      aria-hidden={!interactive}
    >
      {items.map((item) => {
        const selected = item.selected === true;
        const labelPoint = resolvePolygonLabelPoint({
          svgPath: item.svgPath,
          xPercent: item.xPercent ?? 0,
          yPercent: item.yPercent ?? 0,
          viewBoxWidth,
          viewBoxHeight,
        });

        return (
          <g
            key={item.id}
            className="map-hotspot-item"
            data-selected={selected ? 'true' : undefined}
          >
            <path
              d={item.svgPath}
              className="map-hotspot-path"
              data-selected={selected ? 'true' : undefined}
              /* `fill` keeps hit-testing when fill-opacity is 0 (idle). */
              pointerEvents={interactive ? 'fill' : 'none'}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={interactive ? item.label : undefined}
              onClick={
                interactive
                  ? (event) => {
                      event.stopPropagation();
                      onSelect?.(item.id);
                    }
                  : undefined
              }
              onKeyDown={
                interactive
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        event.stopPropagation();
                        onSelect?.(item.id);
                      }
                    }
                  : undefined
              }
            />
            {labelPoint ? (
              <g className="map-hotspot-label" pointerEvents="none" aria-hidden="true">
                <circle
                  cx={labelPoint.x}
                  cy={labelPoint.y}
                  r={labelRadius}
                  className="map-hotspot-label-disc"
                />
                <text
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={labelFontSize}
                  className="map-hotspot-label-text"
                >
                  {item.label}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};
