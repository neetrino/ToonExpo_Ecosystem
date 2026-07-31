import type { Map as MapLibreMap } from 'maplibre-gl';

/** Transparent 1×1 placeholder for OpenFreeMap POI icons missing from the sprite. */
const MISSING_ICON_SIZE_PX = 1;

/**
 * OpenFreeMap liberty (and similar OSM styles) reference POI icon ids that are
 * not always present in the published sprite. Register empty placeholders so
 * MapLibre stops logging `styleimagemissing` for every zoom/pan.
 */
export const bindCityMapMissingImageHandler = (map: MapLibreMap): (() => void) => {
  const registeredIds = new Set<string>();

  const onMissing = (event: { id: string }): void => {
    const imageId = event.id;
    if (!imageId || map.hasImage(imageId) || registeredIds.has(imageId)) {
      return;
    }
    registeredIds.add(imageId);
    map.addImage(imageId, {
      width: MISSING_ICON_SIZE_PX,
      height: MISSING_ICON_SIZE_PX,
      data: new Uint8Array([0, 0, 0, 0]),
    });
  };

  map.on('styleimagemissing', onMissing);
  return () => {
    map.off('styleimagemissing', onMissing);
    registeredIds.clear();
  };
};
