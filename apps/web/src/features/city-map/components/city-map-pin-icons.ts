import type { Map as MapLibreMap } from 'maplibre-gl';

/** Brand tokens from `theme.css` (MapLibre paint cannot read CSS vars). */
export const CITY_MAP_PIN_BRAND = '#1a8f98';
export const CITY_MAP_PIN_BRAND_LIGHT = '#2ba8b0';
export const CITY_MAP_PIN_BRAND_DEEP = '#092b44';
export const CITY_MAP_PIN_ACCENT = '#b8956c';
export const CITY_MAP_PIN_DRAFT = '#8aa0b2';
export const CITY_MAP_PIN_DRAFT_LIGHT = '#a8b8c6';
export const CITY_MAP_PIN_ARCHIVED = '#6b7c8a';
export const CITY_MAP_PIN_ARCHIVED_LIGHT = '#8493a0';
export const CITY_MAP_PIN_STROKE = '#ffffff';

export const CITY_MAP_PIN_IMAGE_DEFAULT = 'city-map-pin-default-v2';
export const CITY_MAP_PIN_IMAGE_SELECTED = 'city-map-pin-selected-v2';
export const CITY_MAP_PIN_IMAGE_DRAFT = 'city-map-pin-draft-v2';
export const CITY_MAP_PIN_IMAGE_ARCHIVED = 'city-map-pin-archived-v2';

const PIN_CANVAS_WIDTH = 72;
const PIN_CANVAS_HEIGHT = 92;
const PIN_PIXEL_RATIO = 2;

type PinPalette = {
  fill: string;
  fillLight: string;
  stroke: string;
  disc: string;
  glyph: string;
  glow?: string;
  ring?: string;
};

const drawGroundShadow = (ctx: CanvasRenderingContext2D, cx: number, tipY: number): void => {
  ctx.save();
  ctx.fillStyle = 'rgba(11, 34, 48, 0.22)';
  ctx.beginPath();
  ctx.ellipse(cx, tipY + 1, 9, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const drawBuildingGlyph = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  color: string,
): void => {
  const bodyW = 11;
  const bodyH = 12;
  const left = cx - bodyW / 2;
  const top = cy - bodyH / 2 + 1;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, top - 4);
  ctx.lineTo(left - 1, top + 1);
  ctx.lineTo(left + bodyW + 1, top + 1);
  ctx.closePath();
  ctx.fill();

  ctx.fillRect(left, top + 1, bodyW, bodyH);

  const windowFill = 'rgba(255, 255, 255, 0.92)';
  const slots: Array<[number, number]> = [
    [-3, 3],
    [2, 3],
    [-3, 7],
    [2, 7],
  ];
  ctx.fillStyle = windowFill;
  for (const [dx, dy] of slots) {
    ctx.fillRect(cx + dx, top + dy, 2.4, 2.4);
  }
};

const drawMarkerPin = (ctx: CanvasRenderingContext2D, palette: PinPalette): void => {
  const cx = PIN_CANVAS_WIDTH / 2;
  const top = 10;
  const radius = 20;
  const headCy = top + radius;
  const tipY = PIN_CANVAS_HEIGHT - 8;

  drawGroundShadow(ctx, cx, tipY);

  ctx.beginPath();
  ctx.moveTo(cx, tipY);
  ctx.bezierCurveTo(cx - 3, tipY - 12, cx - radius, headCy + 10, cx - radius, headCy);
  ctx.arc(cx, headCy, radius, Math.PI, 0, false);
  ctx.bezierCurveTo(cx + radius, headCy + 10, cx + 3, tipY - 12, cx, tipY);
  ctx.closePath();

  if (palette.glow) {
    ctx.shadowColor = palette.glow;
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;
  }

  const fill = ctx.createLinearGradient(cx, top, cx, tipY);
  fill.addColorStop(0, palette.fillLight);
  fill.addColorStop(0.55, palette.fill);
  fill.addColorStop(1, palette.fill);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  if (palette.ring) {
    ctx.lineWidth = 5;
    ctx.strokeStyle = palette.ring;
    ctx.stroke();
  }

  ctx.lineWidth = 3;
  ctx.strokeStyle = palette.stroke;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx - 6, headCy - 7, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, headCy, 11, 0, Math.PI * 2);
  ctx.fillStyle = palette.disc;
  ctx.fill();

  drawBuildingGlyph(ctx, cx, headCy, palette.glyph);
};

const createPinImageData = (
  palette: PinPalette,
): {
  width: number;
  height: number;
  data: Uint8Array;
} => {
  const canvas = document.createElement('canvas');
  canvas.width = PIN_CANVAS_WIDTH * PIN_PIXEL_RATIO;
  canvas.height = PIN_CANVAS_HEIGHT * PIN_PIXEL_RATIO;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      width: PIN_CANVAS_WIDTH,
      height: PIN_CANVAS_HEIGHT,
      data: new Uint8Array(PIN_CANVAS_WIDTH * PIN_CANVAS_HEIGHT * 4),
    };
  }
  ctx.scale(PIN_PIXEL_RATIO, PIN_PIXEL_RATIO);
  drawMarkerPin(ctx, palette);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return {
    width: canvas.width,
    height: canvas.height,
    data: new Uint8Array(imageData.data.buffer),
  };
};

const PIN_IMAGES: Array<{ id: string; palette: PinPalette }> = [
  {
    id: CITY_MAP_PIN_IMAGE_DEFAULT,
    palette: {
      fill: CITY_MAP_PIN_BRAND,
      fillLight: CITY_MAP_PIN_BRAND_LIGHT,
      stroke: CITY_MAP_PIN_STROKE,
      disc: '#ffffff',
      glyph: CITY_MAP_PIN_BRAND_DEEP,
      glow: 'rgba(9, 43, 68, 0.32)',
    },
  },
  {
    id: CITY_MAP_PIN_IMAGE_SELECTED,
    palette: {
      fill: CITY_MAP_PIN_BRAND_DEEP,
      fillLight: '#134060',
      stroke: CITY_MAP_PIN_STROKE,
      disc: '#ffffff',
      glyph: CITY_MAP_PIN_BRAND_DEEP,
      glow: 'rgba(184, 149, 108, 0.55)',
      ring: CITY_MAP_PIN_ACCENT,
    },
  },
  {
    id: CITY_MAP_PIN_IMAGE_DRAFT,
    palette: {
      fill: CITY_MAP_PIN_DRAFT,
      fillLight: CITY_MAP_PIN_DRAFT_LIGHT,
      stroke: CITY_MAP_PIN_STROKE,
      disc: '#f8fafc',
      glyph: '#475569',
      glow: 'rgba(11, 34, 48, 0.18)',
    },
  },
  {
    id: CITY_MAP_PIN_IMAGE_ARCHIVED,
    palette: {
      fill: CITY_MAP_PIN_ARCHIVED,
      fillLight: CITY_MAP_PIN_ARCHIVED_LIGHT,
      stroke: '#e2e8f0',
      disc: '#f8fafc',
      glyph: '#64748b',
      glow: 'rgba(11, 34, 48, 0.12)',
    },
  },
];

/**
 * Registers brand-styled teardrop pin sprites on the MapLibre map (once).
 */
export const ensureCityMapPinImages = (map: MapLibreMap): void => {
  for (const item of PIN_IMAGES) {
    if (map.hasImage(item.id)) {
      continue;
    }
    map.addImage(item.id, createPinImageData(item.palette), { pixelRatio: PIN_PIXEL_RATIO });
  }
};
