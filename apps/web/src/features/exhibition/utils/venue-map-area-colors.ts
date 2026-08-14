export type VenueMapAreaColor = {
  fill: string;
  stroke: string;
  fillOpacity: number;
  strokeOpacity: number;
};

type VenueMapAreaSwatch = {
  fill: string;
  stroke: string;
  fillOpacity: number;
};

/**
 * BOS `AREA_COLOR_PALETTE` as SVG hex + opacity (rgba in SVG fill can fall back to black).
 */
export const VENUE_MAP_AREA_COLORS: readonly VenueMapAreaSwatch[] = [
  { fill: '#283994', stroke: '#283994', fillOpacity: 0.28 },
  { fill: '#0284c7', stroke: '#0284c7', fillOpacity: 0.28 },
  { fill: '#0d9488', stroke: '#0d9488', fillOpacity: 0.28 },
  { fill: '#d97706', stroke: '#d97706', fillOpacity: 0.28 },
  { fill: '#9a7b4f', stroke: '#9a7b4f', fillOpacity: 0.3 },
  { fill: '#e11d48', stroke: '#e11d48', fillOpacity: 0.26 },
  { fill: '#7c3aed', stroke: '#7c3aed', fillOpacity: 0.28 },
  { fill: '#059669', stroke: '#059669', fillOpacity: 0.28 },
  { fill: '#ea580c', stroke: '#ea580c', fillOpacity: 0.28 },
  { fill: '#0891b2', stroke: '#0891b2', fillOpacity: 0.28 },
  { fill: '#be185d', stroke: '#be185d', fillOpacity: 0.26 },
  { fill: '#4338ca', stroke: '#4338ca', fillOpacity: 0.28 },
] as const;

const GOLDEN_ANGLE_DEG = 137.508;
const GENERATED_SATURATION_PCT = 62;
const GENERATED_LIGHTNESS_PCT = 42;
const AREA_FILL_ALPHA = 0.28;
const AREA_STROKE_ALPHA = 0.95;
const SELECTED_AREA_FILL_ALPHA = 0.42;

const generatedAreaSwatch = (index: number): VenueMapAreaSwatch => {
  const hue = Math.round((index * GOLDEN_ANGLE_DEG) % 360);
  const color = `hsl(${hue}, ${GENERATED_SATURATION_PCT}%, ${GENERATED_LIGHTNESS_PCT}%)`;
  return { fill: color, stroke: color, fillOpacity: AREA_FILL_ALPHA };
};

const toAreaColor = (swatch: VenueMapAreaSwatch, highlighted: boolean): VenueMapAreaColor => ({
  fill: swatch.fill,
  stroke: swatch.stroke,
  fillOpacity: highlighted ? SELECTED_AREA_FILL_ALPHA : swatch.fillOpacity,
  strokeOpacity: AREA_STROKE_ALPHA,
});

/**
 * Color for the N-th BOS area (0-based list index), including highlight.
 */
export const resolveVenueMapAreaColor = (
  colorIndex: number,
  highlighted: boolean,
): VenueMapAreaColor => {
  const safeIndex = Number.isFinite(colorIndex) ? Math.max(0, Math.floor(colorIndex)) : 0;
  const swatch = VENUE_MAP_AREA_COLORS[safeIndex] ?? generatedAreaSwatch(safeIndex);
  return toAreaColor(swatch, highlighted);
};
