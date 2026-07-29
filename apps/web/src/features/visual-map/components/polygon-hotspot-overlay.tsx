'use client';

export type PolygonHotspotOverlayItem = {
  id: string;
  label: string;
  svgPath: string;
  selected?: boolean;
};

type PolygonHotspotOverlayProps = {
  items: PolygonHotspotOverlayItem[];
  viewBoxWidth: number;
  viewBoxHeight: number;
  interactive?: boolean;
  onSelect?: (id: string) => void;
};

/**
 * SVG overlay for published polygon hotspots (Admin viewBox pixel `d` paths).
 * Scales with the image via matching viewBox + absolute inset overlay.
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

  return (
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
            /* `fill` keeps hit-testing when fill-opacity is 0 (inactive). */
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
        );
      })}
    </svg>
  );
};
