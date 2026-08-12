'use client';

import type { PublicVenueMapArea } from '@toonexpo/contracts';

import { resolveVenueMapAreaTitle } from '@/features/exhibition/utils/resolve-venue-map-area-title';
import { resolveVenueMapAreaColor } from '@/features/exhibition/utils/venue-map-area-colors';

const VENUE_MAP_STROKE_WIDTH = 1;
const VENUE_MAP_STROKE_WIDTH_HIGHLIGHTED = 1.75;

type VenueMapAreaGroupProps = {
  area: PublicVenueMapArea;
  highlighted: boolean;
  fontSize: number;
  onSelect: (areaId: string) => void;
};

/**
 * Clickable area geometry + label for the public venue map SVG.
 */
export const VenueMapAreaGroup = ({
  area,
  highlighted,
  fontSize,
  onSelect,
}: VenueMapAreaGroupProps) => {
  const title = resolveVenueMapAreaTitle(area);
  const isHidden = area.displayMode === 'hidden';
  const color = resolveVenueMapAreaColor(area.id, isHidden);

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={title}
      className="cursor-pointer outline-none"
      onClick={() => onSelect(area.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(area.id);
        }
      }}
    >
      {area.rects.map((rect, index) => (
        <rect
          key={`${area.id}-${index}`}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          fill={highlighted ? color.fillHighlighted : color.fill}
          stroke={highlighted ? color.strokeHighlighted : color.stroke}
          strokeWidth={
            highlighted ? VENUE_MAP_STROKE_WIDTH_HIGHLIGHTED : VENUE_MAP_STROKE_WIDTH
          }
        />
      ))}
      {isHidden ? null : (
        <text
          x={area.labelX}
          y={area.labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="pointer-events-none fill-ink font-bold"
          fontSize={fontSize}
          fontWeight={700}
        >
          {title}
        </text>
      )}
    </g>
  );
};
