import type { MapLibreMap } from 'maplibre-gl';

type MapStyleSlot = {
  loaded?: () => boolean;
};

/**
 * True when the map still has a style and that style has finished loading.
 * Do not call `isStyleLoaded()` here — it warns once `map.style` is gone.
 */
export const mapStyleIsReady = (map: MapLibreMap): boolean => {
  const style = (map as MapLibreMap & { style?: MapStyleSlot | null }).style;
  if (!style || typeof style.loaded !== 'function') {
    return false;
  }
  try {
    return style.loaded();
  } catch {
    return false;
  }
};
