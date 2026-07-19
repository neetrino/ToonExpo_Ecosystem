export type PercentMapMarker = {
  id: string;
  label: string;
  xPercent: string | number;
  yPercent: string | number;
  warning?: boolean;
  selected?: boolean;
};

type PercentMapMarkersProps = {
  markers: PercentMapMarker[];
  interactive?: boolean;
  onSelectMarker?: (markerId: string) => void;
  showLabels?: boolean;
};

/**
 * SVG overlay for percent-positioned map markers (no CSS inline positioning).
 */
export const PercentMapMarkers = ({
  markers,
  interactive = false,
  onSelectMarker,
  showLabels = false,
}: PercentMapMarkersProps) => {
  if (markers.length === 0) {
    return null;
  }

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden={!interactive}
    >
      {markers.map((marker) => {
        const x = Number(marker.xPercent);
        const y = Number(marker.yPercent);
        const selected = marker.selected === true;
        const warning = marker.warning === true;

        return (
          <g key={marker.id}>
            {interactive ? (
              <circle
                cx={x}
                cy={y}
                r={4}
                className="cursor-pointer fill-transparent"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectMarker?.(marker.id);
                }}
              />
            ) : null}
            <circle
              cx={x}
              cy={y}
              r={selected ? 2.8 : 2.2}
              className={
                warning
                  ? "fill-warning stroke-background stroke-[0.35]"
                  : selected
                    ? "fill-brand stroke-background stroke-[0.45]"
                    : "fill-brand stroke-background stroke-[0.35]"
              }
              pointerEvents="none"
            />
            {showLabels ? (
              <text
                x={x}
                y={y - 3.5}
                textAnchor="middle"
                className="fill-ink text-[2.8px] font-semibold"
                pointerEvents="none"
              >
                {marker.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

/**
 * Computes percent coordinates from a click within a bounding rect.
 */
export const percentFromPointer = (
  clientX: number,
  clientY: number,
  rect: DOMRect,
): { xPercent: number; yPercent: number } => {
  const xPercent = ((clientX - rect.left) / rect.width) * 100;
  const yPercent = ((clientY - rect.top) / rect.height) * 100;

  return {
    xPercent: Math.round(Math.min(100, Math.max(0, xPercent)) * 100) / 100,
    yPercent: Math.round(Math.min(100, Math.max(0, yPercent)) * 100) / 100,
  };
};
