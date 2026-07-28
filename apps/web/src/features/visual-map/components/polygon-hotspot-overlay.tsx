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
 * SVG overlay for published polygon hotspots (Defense viewBox pixel `d` paths).
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
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden={!interactive}
    >
      {items.map((item) => {
        const selected = item.selected === true;
        return (
          <path
            key={item.id}
            d={item.svgPath}
            className={
              selected
                ? 'fill-brand/35 stroke-brand stroke-2'
                : 'fill-brand/20 stroke-brand stroke-[1.5]'
            }
            pointerEvents={interactive ? 'auto' : 'none'}
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
          />
        );
      })}
    </svg>
  );
};
