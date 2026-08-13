'use client';

import type { PublicVenueMapArea } from '@toonexpo/contracts';

import { resolveVenueMapAreaTitle } from '@/features/exhibition/utils/resolve-venue-map-area-title';
import { resolveVenueMapAreaColor } from '@/features/exhibition/utils/venue-map-area-colors';
import { venueMapOuterEdges } from '@/features/exhibition/utils/venue-map-outer-edges';

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
  areaId: string;
  rects: PublicVenueMapArea['rects'];
  fill: string;
  stroke: string;
  fillOpacity: number;
  strokeOpacity: number;
  strokeWidth: number;
};

const VenueMapAreaShape = ({
  areaId,
  rects,
  fill,
  stroke,
  fillOpacity,
  strokeOpacity,
  strokeWidth,
}: VenueMapAreaShapeProps) => (
  <>
    {rects.map((rect, index) => (
      <rect
        key={`${areaId}-fill-${index}`}
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        fill={fill}
        fillOpacity={fillOpacity}
      />
    ))}
    {venueMapOuterEdges(rects).map((edge, index) => (
      <line
        key={`${areaId}-edge-${index}`}
        x1={edge.x1}
        y1={edge.y1}
        x2={edge.x2}
        y2={edge.y2}
        fill="none"
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeWidth={strokeWidth}
        strokeLinecap="square"
      />
    ))}
  </>
);

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
        areaId={area.id}
        rects={area.rects}
        fill={color.fill}
        stroke={color.stroke}
        fillOpacity={color.fillOpacity}
        strokeOpacity={color.strokeOpacity}
        strokeWidth={
          highlighted ? VENUE_MAP_STROKE_WIDTH_HIGHLIGHTED : VENUE_MAP_STROKE_WIDTH
        }
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
