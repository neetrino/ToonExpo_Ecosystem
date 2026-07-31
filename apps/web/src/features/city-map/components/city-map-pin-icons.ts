import type { Map as MapLibreMap } from 'maplibre-gl';

/** Brand tokens from `theme.css` (MapLibre paint cannot read CSS vars). */
export const CITY_MAP_PIN_BRAND = '#1a8f98';
export const CITY_MAP_PIN_BRAND_DEEP = '#092b44';
export const CITY_MAP_PIN_ACCENT = '#b8956c';
export const CITY_MAP_PIN_DRAFT = '#8aa0b2';
export const CITY_MAP_PIN_ARCHIVED = '#6b7c8a';
export const CITY_MAP_PIN_STROKE = '#ffffff';

export const CITY_MAP_PIN_IMAGE_DEFAULT = 'city-map-pin-default';
export const CITY_MAP_PIN_IMAGE_SELECTED = 'city-map-pin-selected';
export const CITY_MAP_PIN_IMAGE_DRAFT = 'city-map-pin-draft';
export const CITY_MAP_PIN_IMAGE_ARCHIVED = 'city-map-pin-archived';

const PIN_CANVAS_WIDTH = 64;
const PIN_CANVAS_HEIGHT = 80;
const PIN_PIXEL_RATIO = 2;

type PinPalette = {
  fill: string;
  stroke: string;
  inner: string;
  glow?: string;
};

const drawMarkerPin = (ctx: CanvasRenderingContext2D, palette: PinPalette): void => {
  const cx = PIN_CANVAS_WIDTH / 2;
  const top = 8;
  const radius = 18;
  const tipY = PIN_CANVAS_HEIGHT - 6;

  ctx.beginPath();
  ctx.moveTo(cx, tipY);
  ctx.bezierCurveTo(cx - 2, tipY - 10, cx - radius, top + radius + 8, cx - radius, top + radius);
  ctx.arc(cx, top + radius, radius, Math.PI, 0, false);
  ctx.bezierCurveTo(cx + radius, top + radius + 8, cx + 2, tipY - 10, cx, tipY);
  ctx.closePath();

  if (palette.glow) {
    ctx.shadowColor = palette.glow;
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 3;
  }
  ctx.fillStyle = palette.fill;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.lineWidth = 3.5;
  ctx.strokeStyle = palette.stroke;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, top + radius, 7, 0, Math.PI * 2);
  ctx.fillStyle = palette.inner;
  ctx.fill();
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
      stroke: CITY_MAP_PIN_STROKE,
      inner: '#e6f4f5',
      glow: 'rgba(9, 43, 68, 0.28)',
    },
  },
  {
    id: CITY_MAP_PIN_IMAGE_SELECTED,
    palette: {
      fill: CITY_MAP_PIN_BRAND_DEEP,
      stroke: CITY_MAP_PIN_ACCENT,
      inner: CITY_MAP_PIN_ACCENT,
      glow: 'rgba(184, 149, 108, 0.45)',
    },
  },
  {
    id: CITY_MAP_PIN_IMAGE_DRAFT,
    palette: {
      fill: CITY_MAP_PIN_DRAFT,
      stroke: CITY_MAP_PIN_STROKE,
      inner: '#f1f5f9',
      glow: 'rgba(11, 34, 48, 0.18)',
    },
  },
  {
    id: CITY_MAP_PIN_IMAGE_ARCHIVED,
    palette: {
      fill: CITY_MAP_PIN_ARCHIVED,
      stroke: '#e2e8f0',
      inner: '#f8fafc',
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
