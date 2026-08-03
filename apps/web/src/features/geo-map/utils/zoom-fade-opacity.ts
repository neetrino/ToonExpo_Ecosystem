import {
  MARKER_DOT_MIN_OPACITY,
  MODEL_FADE_MIN_OPACITY,
  MODEL_FADE_ZOOM_DELTA,
} from '@/features/geo-map/constants';

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * Dot marker opacity — always fully visible for discoverability (dots stay on
 * after the 3D model appears). Zoom args retained for call-site compatibility.
 */
export const computeMarkerFadeOpacity = (zoom: number, minZoom: number): number => {
  void zoom;
  void minZoom;
  return MARKER_DOT_MIN_OPACITY;
};

/**
 * Model layer opacity after `minZoom` — starts at {@link MODEL_FADE_MIN_OPACITY}
 * and reaches 1 over {@link MODEL_FADE_ZOOM_DELTA} zoom levels.
 */
export const computeModelFadeOpacity = (zoom: number, minZoom: number): number => {
  if (zoom < minZoom) {
    return 0;
  }
  const progress = (zoom - minZoom) / MODEL_FADE_ZOOM_DELTA;
  return clamp01(MODEL_FADE_MIN_OPACITY + (1 - MODEL_FADE_MIN_OPACITY) * progress);
};

/** Lowest `minZoom` among visible model objects (layer-wide opacity). */
export const resolveLayerMinZoom = (minZooms: readonly number[]): number | null => {
  if (minZooms.length === 0) {
    return null;
  }
  return Math.min(...minZooms);
};
