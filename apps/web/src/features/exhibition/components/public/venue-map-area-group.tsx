'use client';

import type { PublicVenueMapArea } from '@toonexpo/contracts';

import { resolveVenueMapAreaTitle } from '@/features/exhibition/utils/resolve-venue-map-area-title';
import { rectsToOutlinePath } from '@/features/exhibition/utils/venue-map-outline-path';
import { resolveVenueMapAreaColor } from '@/features/exhibition/utils/venue-map-area-colors';

const VENUE_MAP_STROKE_WIDTH = 1;
const VENUE_MAP_STROKE_WIDTH_HIGHLIGHTED = 1.75;

type VenueMapAreaGroupProps = {
  area: PublicVenueMapArea;
  colorIndex: number;
  highlighted: boolean;
  fontSize: number;
  onSelect: (areaId: string) => void;
};

type VenueMapAreaShapeProps = {
  rects: PublicVenueMapArea['rects'];
  fill: string;
  stroke: string;
  fillOpacity: number;
  strokeOpacity: number;
  strokeWidth: number;
};

const VenueMapAreaShape = ({
  rects,
  fill,
  stroke,
  fillOpacity,
  strokeOpacity,
  strokeWidth,
}: VenueMapAreaShapeProps) => {
  const path = rectsToOutlinePath(rects);
  if (path.length === 0) {
    return null;
  }
  return (
    <path
      d={path}
      fill={fill}
      fillOpacity={fillOpacity}
      stroke={stroke}
      strokeOpacity={strokeOpacity}
      strokeWidth={strokeWidth}
      strokeLinejoin="miter"
      fillRule="evenodd"
    />
  );
};

/**
 * Clickable area geometry + label for the public venue map SVG.
 */
export const VenueMapAreaGroup = ({
  area,
  colorIndex,
  highlighted,
  fontSize,
  onSelect,
}: VenueMapAreaGroupProps) => {
  const title = resolveVenueMapAreaTitle(area);
  const isHidden = area.displayMode === 'hidden';
  const color = resolveVenueMapAreaColor(colorIndex, highlighted);

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={title}
      className="cursor-pointer outline-none"
      fill="none"
      onClick={() => onSelect(area.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(area.id);
        }
      }}
    >
      <VenueMapAreaShape
        rects={area.rects}
        fill={color.fill}
        stroke={color.stroke}
        fillOpacity={color.fillOpacity}
        strokeOpacity={color.strokeOpacity}
        strokeWidth={highlighted ? VENUE_MAP_STROKE_WIDTH_HIGHLIGHTED : VENUE_MAP_STROKE_WIDTH}
      />
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
