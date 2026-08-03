import type { ExpressionSpecification } from 'maplibre-gl';

/**
 * Height expression used for extrusion tint (OpenFreeMap / OMT properties).
 */
export const BUILDING_HEIGHT_EXPR: ExpressionSpecification = [
  'coalesce',
  ['get', 'render_height'],
  ['get', 'height'],
  ['*', ['coalesce', ['get', 'building:levels'], 3], 3],
  10,
];

/**
 * Height-tinted extrusion color — soft warm low-rise → cooler tall.
 * `timeBase` shifts the palette (brand stone / atmosphere tint).
 */
export const realisticBuildingColorExpr = (timeBase: string): ExpressionSpecification => {
  const low = mixHex(timeBase, '#e2d4be', 0.55);
  const mid = mixHex(timeBase, '#b9b5ad', 0.5);
  const tall = mixHex(timeBase, '#8e9eac', 0.48);
  const tower = mixHex(timeBase, '#6f8192', 0.45);

  return [
    'interpolate',
    ['linear'],
    BUILDING_HEIGHT_EXPR,
    0,
    low,
    12,
    low,
    22,
    mid,
    40,
    tall,
    80,
    tower,
    140,
    shadeHex(tower, -0.1),
  ];
};

/** Mix two hex colors; `amount` is weight toward `to` (0–1). */
export const mixHex = (from: string, to: string, amount: number): string => {
  const a = parseHex(from);
  const b = parseHex(to);
  if (!a || !b) {
    return from;
  }
  const t = Math.max(0, Math.min(1, amount));
  const mix = (x: number, y: number): number => Math.round(x + (y - x) * t);
  return toHex(mix(a.r, b.r), mix(a.g, b.g), mix(a.b, b.b));
};

/** Lighten (`amount` > 0) or darken (`amount` < 0) a hex color. */
export const shadeHex = (hex: string, amount: number): string => {
  const rgb = parseHex(hex);
  if (!rgb) {
    return hex;
  }
  const t = (c: number): number => {
    const next = amount >= 0 ? c + (255 - c) * amount : c * (1 + amount);
    return Math.max(0, Math.min(255, Math.round(next)));
  };
  return toHex(t(rgb.r), t(rgb.g), t(rgb.b));
};

const parseHex = (hex: string): { r: number; g: number; b: number } | null => {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) {
    return null;
  }
  const n = Number.parseInt(raw, 16);
  if (!Number.isFinite(n)) {
    return null;
  }
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const toHex = (r: number, g: number, b: number): string =>
  `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
