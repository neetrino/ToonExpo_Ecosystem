'use client';

import { useState } from 'react';

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

const LABEL_COMPACT_MAX_CHARS = 2;

/**
 * SVG polygon hit-targets + HTML label badges.
 * Badges stay circular (not warped by the stretched SVG viewBox).
 */
export const PolygonHotspotOverlay = ({
  items,
  viewBoxWidth,
  viewBoxHeight,
  interactive = false,
  onSelect,
}: PolygonHotspotOverlayProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (items.length === 0 || viewBoxWidth <= 0 || viewBoxHeight <= 0) {
    return null;
  }

  return (
    <>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        aria-hidden={!interactive}
      >
        {items.map((item) => {
          const selected = item.selected === true;
          return (
            <path
              key={item.id}
              d={item.svgPath}
              className="map-hotspot-path"
              data-selected={selected ? 'true' : undefined}
              /* `fill` keeps hit-testing when fill-opacity is 0 (idle). */
              pointerEvents={interactive ? 'fill' : 'none'}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={interactive ? item.label : undefined}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId((current) => (current === item.id ? null : current))}
              onFocus={() => setHoveredId(item.id)}
              onBlur={() => setHoveredId((current) => (current === item.id ? null : current))}
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
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
        {items.map((item) => {
          const labelPoint = resolvePolygonLabelPoint({
            svgPath: item.svgPath,
            xPercent: item.xPercent ?? 0,
            yPercent: item.yPercent ?? 0,
            viewBoxWidth,
            viewBoxHeight,
          });
          if (!labelPoint) {
            return null;
          }

          const visible = item.selected === true || hoveredId === item.id;
          const compact = item.label.trim().length <= LABEL_COMPACT_MAX_CHARS;
          const leftPercent = (labelPoint.x / viewBoxWidth) * 100;
          const topPercent = (labelPoint.y / viewBoxHeight) * 100;

          return (
            <span
              key={`label-${item.id}`}
              className={`map-hotspot-badge ${compact ? 'map-hotspot-badge--compact' : 'map-hotspot-badge--pill'} ${
                visible ? 'map-hotspot-badge--visible' : ''
              }`}
              style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
            >
              {item.label}
            </span>
          );
        })}
      </div>
    </>
  );
};
