import type { MapLibreMap } from 'maplibre-gl';

/** 1×1 transparent RGBA placeholder for OpenFreeMap liberty POI icons absent from the sprite. */
const MISSING_STYLE_IMAGE_SIZE_PX = 1;
const MISSING_STYLE_IMAGE_BYTES_PER_PIXEL = 4;

type StyleImageData = {
  width: number;
  height: number;
  data: Uint8Array;
};

/**
 * Fully transparent RGBA buffer — MapLibre stops warning once the id is registered.
 */
export const createTransparentStyleImage = (): StyleImageData => ({
  width: MISSING_STYLE_IMAGE_SIZE_PX,
  height: MISSING_STYLE_IMAGE_SIZE_PX,
  data: new Uint8Array(
    MISSING_STYLE_IMAGE_SIZE_PX * MISSING_STYLE_IMAGE_SIZE_PX * MISSING_STYLE_IMAGE_BYTES_PER_PIXEL,
  ),
});

/**
 * OpenFreeMap "liberty" references OSM amenity icons (office, atm, …) that are
 * not present in its sprite. Without a resolver MapLibre logs a console warning
 * per missing id. Register a no-op transparent image so the style keeps working.
 */
export const registerMissingStyleImageResolver = (map: MapLibreMap): void => {
  map.setMissingStyleImageResolver((id) => {
    if (map.hasImage(id)) {
      return;
    }
    map.addImage(id, createTransparentStyleImage());
  });
};
