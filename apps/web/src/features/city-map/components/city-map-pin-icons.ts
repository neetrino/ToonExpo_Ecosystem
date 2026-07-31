import type { Map as MapLibreMap } from 'maplibre-gl';

/** Brand tokens from `theme.css` (MapLibre paint cannot read CSS vars). */
export const CITY_MAP_PIN_BRAND = '#1a8f98';
export const CITY_MAP_PIN_BRAND_LIGHT = '#2ba8b0';
export const CITY_MAP_PIN_BRAND_DEEP = '#0f6b73';
export const CITY_MAP_PIN_NAVY = '#092b44';
export const CITY_MAP_PIN_ACCENT = '#b8956c';
export const CITY_MAP_PIN_ACCENT_LIGHT = '#d4b896';
export const CITY_MAP_PIN_IVORY = '#fbf8f3';
export const CITY_MAP_PIN_DRAFT = '#7d8f9e';
export const CITY_MAP_PIN_ARCHIVED = '#6b7c8a';
export const CITY_MAP_PIN_STROKE = '#ffffff';

export const CITY_MAP_PIN_IMAGE_DEFAULT = 'city-map-pin-default-v4';
export const CITY_MAP_PIN_IMAGE_SELECTED = 'city-map-pin-selected-v4';
export const CITY_MAP_PIN_IMAGE_DRAFT = 'city-map-pin-draft-v4';
export const CITY_MAP_PIN_IMAGE_ARCHIVED = 'city-map-pin-archived-v4';

const PIN_CANVAS_WIDTH = 80;
const PIN_CANVAS_HEIGHT = 100;
const PIN_PIXEL_RATIO = 3;

type PinPalette = {
  fillTop: string;
  fillMid: string;
  fillBottom: string;
  rim: string;
  rimInner: string;
  disc: string;
  discRing: string;
  glyphRoof: string;
  glyphBody: string;
  glow: string;
  jewel?: boolean;
};

const drawGroundShadow = (ctx: CanvasRenderingContext2D, cx: number, tipY: number): void => {
  const shade = ctx.createRadialGradient(cx, tipY + 1, 1, cx, tipY + 1, 14);
  shade.addColorStop(0, 'rgba(6, 28, 44, 0.35)');
  shade.addColorStop(1, 'rgba(6, 28, 44, 0)');
  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.ellipse(cx, tipY + 2, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();
};

/** Brand house mark proportions (from Figma `81:607`), scaled into the pin disc. */
const drawHouseGlyph = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  roof: string,
  body: string,
): void => {
  const s = 0.55;
  const ox = cx - 14 * s;
  const oy = cy - 13 * s;

  ctx.fillStyle = roof;
  ctx.beginPath();
  ctx.moveTo(ox + 3.5 * s, oy + 15.75 * s);
  ctx.lineTo(ox + 14 * s, oy + 5.25 * s);
  ctx.lineTo(ox + 19.25 * s, oy + 9.625 * s);
  ctx.lineTo(ox + 19.25 * s, oy + 6.125 * s);
  ctx.lineTo(ox + 22.75 * s, oy + 6.125 * s);
  ctx.lineTo(ox + 22.75 * s, oy + 12.25 * s);
  ctx.lineTo(ox + 24.5 * s, oy + 14 * s);
  ctx.lineTo(ox + 24.5 * s, oy + 15.75 * s);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = body;
  ctx.fillRect(ox + 6.125 * s, oy + 15.75 * s, 15.75 * s, 7 * s);
};

const tracePinPath = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  headCy: number,
  radius: number,
  tipY: number,
): void => {
  ctx.beginPath();
  ctx.moveTo(cx, tipY);
  ctx.bezierCurveTo(cx - 2.5, tipY - 14, cx - radius, headCy + 12, cx - radius, headCy);
  ctx.arc(cx, headCy, radius, Math.PI, 0, false);
  ctx.bezierCurveTo(cx + radius, headCy + 12, cx + 2.5, tipY - 14, cx, tipY);
  ctx.closePath();
};

const drawMarkerPin = (ctx: CanvasRenderingContext2D, palette: PinPalette): void => {
  const cx = PIN_CANVAS_WIDTH / 2;
  const top = 12;
  const radius = 22;
  const headCy = top + radius;
  const tipY = PIN_CANVAS_HEIGHT - 10;

  drawGroundShadow(ctx, cx, tipY);
  tracePinPath(ctx, cx, headCy, radius, tipY);

  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = palette.jewel ? 18 : 12;
  ctx.shadowOffsetY = 5;

  const fill = ctx.createLinearGradient(cx, top, cx, tipY);
  fill.addColorStop(0, palette.fillTop);
  fill.addColorStop(0.42, palette.fillMid);
  fill.addColorStop(1, palette.fillBottom);
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.lineWidth = 4.5;
  ctx.strokeStyle = palette.rim;
  ctx.stroke();

  ctx.lineWidth = 1.6;
  ctx.strokeStyle = palette.rimInner;
  ctx.stroke();

  const sheen = ctx.createRadialGradient(cx - 8, headCy - 10, 1, cx - 4, headCy - 4, 18);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
  sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheen;
  ctx.beginPath();
  ctx.arc(cx, headCy, radius - 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, headCy, 12.5, 0, Math.PI * 2);
  ctx.fillStyle = palette.disc;
  ctx.fill();

  ctx.lineWidth = 1.8;
  ctx.strokeStyle = palette.discRing;
  ctx.stroke();

  drawHouseGlyph(ctx, cx, headCy + 0.5, palette.glyphRoof, palette.glyphBody);
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
      fillTop: CITY_MAP_PIN_BRAND_LIGHT,
      fillMid: CITY_MAP_PIN_BRAND,
      fillBottom: CITY_MAP_PIN_BRAND_DEEP,
      rim: CITY_MAP_PIN_STROKE,
      rimInner: 'rgba(255, 255, 255, 0.45)',
      disc: CITY_MAP_PIN_IVORY,
      discRing: CITY_MAP_PIN_ACCENT,
      glyphRoof: CITY_MAP_PIN_ACCENT,
      glyphBody: CITY_MAP_PIN_NAVY,
      glow: 'rgba(15, 107, 115, 0.4)',
    },
  },
  {
    id: CITY_MAP_PIN_IMAGE_SELECTED,
    palette: {
      fillTop: '#3bb8c0',
      fillMid: CITY_MAP_PIN_BRAND,
      fillBottom: CITY_MAP_PIN_NAVY,
      rim: CITY_MAP_PIN_ACCENT_LIGHT,
      rimInner: CITY_MAP_PIN_STROKE,
      disc: CITY_MAP_PIN_IVORY,
      discRing: CITY_MAP_PIN_ACCENT,
      glyphRoof: CITY_MAP_PIN_ACCENT,
      glyphBody: CITY_MAP_PIN_NAVY,
      glow: 'rgba(184, 149, 108, 0.55)',
      jewel: true,
    },
  },
  {
    id: CITY_MAP_PIN_IMAGE_DRAFT,
    palette: {
      fillTop: '#9aabba',
      fillMid: CITY_MAP_PIN_DRAFT,
      fillBottom: '#657787',
      rim: '#e8eef2',
      rimInner: 'rgba(255, 255, 255, 0.4)',
      disc: '#f5f7f9',
      discRing: '#c5d0d8',
      glyphRoof: '#a8b8c6',
      glyphBody: '#4a5c6a',
      glow: 'rgba(11, 34, 48, 0.2)',
    },
  },
  {
    id: CITY_MAP_PIN_IMAGE_ARCHIVED,
    palette: {
      fillTop: '#8493a0',
      fillMid: CITY_MAP_PIN_ARCHIVED,
      fillBottom: '#556370',
      rim: '#dce3e8',
      rimInner: 'rgba(255, 255, 255, 0.3)',
      disc: '#f1f4f6',
      discRing: '#b0bcc6',
      glyphRoof: '#9aa8b4',
      glyphBody: '#5a6a76',
      glow: 'rgba(11, 34, 48, 0.14)',
    },
  },
];

/**
 * Registers luxury brand pin sprites (teal + champagne) on the MapLibre map.
 */
export const ensureCityMapPinImages = (map: MapLibreMap): void => {
  for (const item of PIN_IMAGES) {
    if (map.hasImage(item.id)) {
      continue;
    }
    map.addImage(item.id, createPinImageData(item.palette), { pixelRatio: PIN_PIXEL_RATIO });
  }
};
