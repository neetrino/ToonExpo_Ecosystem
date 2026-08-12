export type VenueMapAreaColor = {
  fill: string;
  stroke: string;
  fillHighlighted: string;
  strokeHighlighted: string;
};

/** Distinct translucent fills so neighboring booths read as separate blocks. */
export const VENUE_MAP_AREA_COLORS: readonly VenueMapAreaColor[] = [
  {
    fill: 'rgba(14, 165, 233, 0.32)',
    stroke: '#0284c7',
    fillHighlighted: 'rgba(14, 165, 233, 0.55)',
    strokeHighlighted: '#0369a1',
  },
  {
    fill: 'rgba(16, 185, 129, 0.32)',
    stroke: '#059669',
    fillHighlighted: 'rgba(16, 185, 129, 0.55)',
    strokeHighlighted: '#047857',
  },
  {
    fill: 'rgba(245, 158, 11, 0.32)',
    stroke: '#d97706',
    fillHighlighted: 'rgba(245, 158, 11, 0.55)',
    strokeHighlighted: '#b45309',
  },
  {
    fill: 'rgba(244, 63, 94, 0.32)',
    stroke: '#e11d48',
    fillHighlighted: 'rgba(244, 63, 94, 0.55)',
    strokeHighlighted: '#be123c',
  },
  {
    fill: 'rgba(139, 92, 246, 0.32)',
    stroke: '#7c3aed',
    fillHighlighted: 'rgba(139, 92, 246, 0.55)',
    strokeHighlighted: '#6d28d9',
  },
  {
    fill: 'rgba(20, 184, 166, 0.32)',
    stroke: '#0d9488',
    fillHighlighted: 'rgba(20, 184, 166, 0.55)',
    strokeHighlighted: '#0f766e',
  },
  {
    fill: 'rgba(249, 115, 22, 0.32)',
    stroke: '#ea580c',
    fillHighlighted: 'rgba(249, 115, 22, 0.55)',
    strokeHighlighted: '#c2410c',
  },
  {
    fill: 'rgba(99, 102, 241, 0.32)',
    stroke: '#4f46e5',
    fillHighlighted: 'rgba(99, 102, 241, 0.55)',
    strokeHighlighted: '#4338ca',
  },
  {
    fill: 'rgba(236, 72, 153, 0.32)',
    stroke: '#db2777',
    fillHighlighted: 'rgba(236, 72, 153, 0.55)',
    strokeHighlighted: '#be185d',
  },
  {
    fill: 'rgba(34, 197, 94, 0.32)',
    stroke: '#16a34a',
    fillHighlighted: 'rgba(34, 197, 94, 0.55)',
    strokeHighlighted: '#15803d',
  },
  {
    fill: 'rgba(6, 182, 212, 0.32)',
    stroke: '#0891b2',
    fillHighlighted: 'rgba(6, 182, 212, 0.55)',
    strokeHighlighted: '#0e7490',
  },
  {
    fill: 'rgba(234, 179, 8, 0.32)',
    stroke: '#ca8a04',
    fillHighlighted: 'rgba(234, 179, 8, 0.55)',
    strokeHighlighted: '#a16207',
  },
] as const;

const HIDDEN_AREA_COLOR: VenueMapAreaColor = {
  fill: 'rgba(15, 23, 42, 0.1)',
  stroke: 'rgba(15, 23, 42, 0.25)',
  fillHighlighted: 'rgba(15, 23, 42, 0.2)',
  strokeHighlighted: 'rgba(15, 23, 42, 0.5)',
};

const hashAreaId = (areaId: string): number => {
  let hash = 0;
  for (let index = 0; index < areaId.length; index += 1) {
    hash = (hash * 31 + areaId.charCodeAt(index)) >>> 0;
  }
  return hash;
};

/**
 * Stable palette color for a venue-map area (same id → same color across filters).
 */
export const resolveVenueMapAreaColor = (
  areaId: string,
  isHidden: boolean,
): VenueMapAreaColor => {
  if (isHidden) {
    return HIDDEN_AREA_COLOR;
  }
  const paletteIndex = hashAreaId(areaId) % VENUE_MAP_AREA_COLORS.length;
  return VENUE_MAP_AREA_COLORS[paletteIndex] ?? VENUE_MAP_AREA_COLORS[0]!;
};
