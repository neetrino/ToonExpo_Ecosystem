import {
  MODEL_FADE_OPACITY_STEP_COUNT,
  MODEL_POSITION_QUANTIZE_DECIMALS,
  VIEWPORT_BOUNDS_QUANTIZE_DECIMALS,
  VIEWPORT_ZOOM_QUANTIZE_DECIMALS,
} from '@/features/geo-map/constants';
import type { AdminOsmHideSession } from '@/features/geo-map/types';
import type { LngLatBounds } from '@/features/geo-map/utils/geo-bounds';

/** Round `value` to a fixed number of decimal places (half-up via `Math.round`). */
export const quantizeDecimal = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/**
 * Snap continuous fade opacity into a few steps so zoom ticks do not recreate
 * ScenegraphLayer instances on every sub-pixel zoom change.
 */
export const quantizeModelFadeOpacity = (
  opacity: number,
  stepCount: number = MODEL_FADE_OPACITY_STEP_COUNT,
): number => {
  if (opacity <= 0) {
    return 0;
  }
  if (opacity >= 1) {
    return 1;
  }
  const safeSteps = Math.max(1, stepCount);
  return Math.round(opacity * safeSteps) / safeSteps;
};

export type ViewportSignatureInput = {
  zoom: number;
  bounds: LngLatBounds | null;
};

/** Stable string for zoom + bounds; used to skip React setState during move. */
export const buildViewportSignature = ({ zoom, bounds }: ViewportSignatureInput): string => {
  const zoomKey = quantizeDecimal(zoom, VIEWPORT_ZOOM_QUANTIZE_DECIMALS).toFixed(
    VIEWPORT_ZOOM_QUANTIZE_DECIMALS,
  );
  if (!bounds) {
    return `z:${zoomKey}|b:null`;
  }
  const d = VIEWPORT_BOUNDS_QUANTIZE_DECIMALS;
  return (
    `z:${zoomKey}|b:` +
    [
      quantizeDecimal(bounds.west, d),
      quantizeDecimal(bounds.south, d),
      quantizeDecimal(bounds.east, d),
      quantizeDecimal(bounds.north, d),
    ]
      .map((value) => value.toFixed(d))
      .join(',')
  );
};

export type FootprintMaskSignatureModel = {
  id: string;
  longitude: number;
  latitude: number;
  sourceOsmId?: string | null | undefined;
};

/** Signature for OSM distance / osm_id mask inputs — skip setFilter when equal. */
export const buildFootprintMaskSignature = (
  models: readonly FootprintMaskSignatureModel[],
): string => {
  if (models.length === 0) {
    return 'empty';
  }
  const d = MODEL_POSITION_QUANTIZE_DECIMALS;
  return [...models]
    .map((model) => {
      const lng = quantizeDecimal(model.longitude, d).toFixed(d);
      const lat = quantizeDecimal(model.latitude, d).toFixed(d);
      const osm = model.sourceOsmId?.trim() ?? '';
      return `${model.id}:${lng},${lat}:${osm}`;
    })
    .sort()
    .join('|');
};

/** Stable key for admin-only OSM hides merged into the extrusion filter. */
export const buildAdminOsmHideSignature = (
  hide: AdminOsmHideSession | null | undefined,
): string => {
  if (!hide || (hide.hiddenOsmIds.length === 0 && hide.hiddenCentroidsWithoutId.length === 0)) {
    return 'hide:empty';
  }
  const ids = [...hide.hiddenOsmIds].sort().join(',');
  const d = MODEL_POSITION_QUANTIZE_DECIMALS;
  const points = [...hide.hiddenCentroidsWithoutId]
    .map((point) => {
      const lng = quantizeDecimal(point.longitude, d).toFixed(d);
      const lat = quantizeDecimal(point.latitude, d).toFixed(d);
      return `${lng},${lat}`;
    })
    .sort()
    .join(';');
  return `hide:${ids}|pts:${points}`;
};

export type ScenegraphSignatureModel = {
  id: string;
  modelUrl: string;
  longitude: number;
  latitude: number;
  altitudeM: number;
  headingDeg: number;
  pitchDeg: number;
  rollDeg: number;
  scale: number;
  minZoom: number;
};

/**
 * Signature for ScenegraphLayer rebuild inputs — ids, quantized pose, opacity,
 * and highlight. Drag updates still invalidate when position moves past quantize.
 */
export const buildScenegraphLayerSignature = (
  models: readonly ScenegraphSignatureModel[],
  opacity: number,
  highlightedObjectId: string | null,
): string => {
  const d = MODEL_POSITION_QUANTIZE_DECIMALS;
  const objectKey =
    models.length === 0
      ? 'empty'
      : [...models]
          .map((model) => {
            const lng = quantizeDecimal(model.longitude, d).toFixed(d);
            const lat = quantizeDecimal(model.latitude, d).toFixed(d);
            return [
              model.id,
              model.modelUrl,
              lng,
              lat,
              quantizeDecimal(model.altitudeM, 2),
              quantizeDecimal(model.headingDeg, 1),
              quantizeDecimal(model.pitchDeg, 1),
              quantizeDecimal(model.rollDeg, 1),
              quantizeDecimal(model.scale, 3),
              quantizeDecimal(model.minZoom, 2),
            ].join(':');
          })
          .sort()
          .join('|');
  return `${objectKey}|op:${opacity}|hl:${highlightedObjectId ?? ''}`;
};
