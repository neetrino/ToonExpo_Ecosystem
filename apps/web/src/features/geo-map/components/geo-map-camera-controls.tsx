'use client';

import type { MapLibreMap } from 'maplibre-gl';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ZoomIn, ZoomOut } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  MAP_BEARING_STEP_DEG,
  MAP_CAMERA_EASE_DURATION_MS,
  MAP_PITCH_STEP_DEG,
  MAP_ZOOM_STEP,
  MAX_MAP_ZOOM,
  MIN_MAP_ZOOM,
} from '@/features/geo-map/constants';
import { clampMapPitch } from '@/features/geo-map/utils/clamp-map-pitch';

export type GeoMapCameraControlsProps = {
  map: MapLibreMap;
};

const BUTTON_CLASS_NAME =
  'flex h-7 w-7 items-center justify-center text-ink transition-colors ' +
  'hover:bg-surface focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-brand-deep disabled:opacity-40';

const clampMapZoom = (zoom: number): number => Math.min(MAX_MAP_ZOOM, Math.max(MIN_MAP_ZOOM, zoom));

/**
 * Stacked panel: zoom in/out, then rotate (←→) and tilt (↑↓).
 * Gesture rotate/pitch (right-drag, touch) remains enabled on the map.
 */
export const GeoMapCameraControls = ({ map }: GeoMapCameraControlsProps) => {
  const t = useTranslations('GeoMap.camera');

  const easeZoomBy = (delta: number): void => {
    map.easeTo({
      zoom: clampMapZoom(map.getZoom() + delta),
      duration: MAP_CAMERA_EASE_DURATION_MS,
      essential: true,
    });
  };

  const easeBearingBy = (deltaDeg: number): void => {
    map.easeTo({
      bearing: map.getBearing() + deltaDeg,
      duration: MAP_CAMERA_EASE_DURATION_MS,
      essential: true,
    });
  };

  const easePitchBy = (deltaDeg: number): void => {
    map.easeTo({
      pitch: clampMapPitch(map.getPitch() + deltaDeg),
      duration: MAP_CAMERA_EASE_DURATION_MS,
      essential: true,
    });
  };

  return (
    <div
      className="pointer-events-auto absolute top-2.5 right-2.5 z-10 flex flex-col overflow-hidden rounded border border-border-strong bg-surface-elevated shadow-sm"
      role="group"
      aria-label={t('groupLabel')}
    >
      <button
        type="button"
        className={BUTTON_CLASS_NAME}
        aria-label={t('zoomIn')}
        title={t('zoomIn')}
        onClick={() => easeZoomBy(MAP_ZOOM_STEP)}
      >
        <ZoomIn className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        className={BUTTON_CLASS_NAME}
        aria-label={t('zoomOut')}
        title={t('zoomOut')}
        onClick={() => easeZoomBy(-MAP_ZOOM_STEP)}
      >
        <ZoomOut className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        className={BUTTON_CLASS_NAME}
        aria-label={t('rotateLeft')}
        title={t('rotateLeft')}
        onClick={() => easeBearingBy(-MAP_BEARING_STEP_DEG)}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        className={BUTTON_CLASS_NAME}
        aria-label={t('rotateRight')}
        title={t('rotateRight')}
        onClick={() => easeBearingBy(MAP_BEARING_STEP_DEG)}
      >
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        className={BUTTON_CLASS_NAME}
        aria-label={t('tiltUp')}
        title={t('tiltUp')}
        onClick={() => easePitchBy(MAP_PITCH_STEP_DEG)}
      >
        <ArrowUp className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        className={BUTTON_CLASS_NAME}
        aria-label={t('tiltDown')}
        title={t('tiltDown')}
        onClick={() => easePitchBy(-MAP_PITCH_STEP_DEG)}
      >
        <ArrowDown className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
};
