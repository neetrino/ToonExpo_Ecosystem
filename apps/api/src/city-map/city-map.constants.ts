import {
  CITY_MAP_DEFAULT_MIN_ZOOM,
  CITY_MAP_DEFAULT_ROTATION_X,
  CITY_MAP_MAX_PLACEMENTS,
} from '@toonexpo/contracts';

export { CITY_MAP_DEFAULT_MIN_ZOOM, CITY_MAP_DEFAULT_ROTATION_X, CITY_MAP_MAX_PLACEMENTS };

export const CITY_MAP_DEFAULT_MAX_GLB_BYTES = 25 * 1024 * 1024;

export const CITY_MAP_STYLE_URL_DEFAULT = 'https://tiles.openfreemap.org/styles/liberty';

export const CITY_MAP_CENTER_LNG_DEFAULT = 44.5152;
export const CITY_MAP_CENTER_LAT_DEFAULT = 40.1872;
export const CITY_MAP_INITIAL_ZOOM_DEFAULT = 14;
export const CITY_MAP_INITIAL_PITCH_DEFAULT = 55;
export const CITY_MAP_INITIAL_BEARING_DEFAULT = -20;

export const CITY_MAP_GLB_MIME_TYPES = ['model/gltf-binary', 'application/octet-stream'] as const;

export type CityMapGlbMimeType = (typeof CITY_MAP_GLB_MIME_TYPES)[number];
