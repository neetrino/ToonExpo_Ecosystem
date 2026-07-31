import type { PublicCityMapConfig } from '@toonexpo/contracts';

import {
  CITY_MAP_CENTER_LAT_DEFAULT,
  CITY_MAP_CENTER_LNG_DEFAULT,
  CITY_MAP_INITIAL_BEARING_DEFAULT,
  CITY_MAP_INITIAL_PITCH_DEFAULT,
  CITY_MAP_INITIAL_ZOOM_DEFAULT,
  CITY_MAP_STYLE_URL_DEFAULT,
} from './city-map.constants.js';

/** Public map camera/style — fixed product defaults (not env-driven). */
export const resolvePublicCityMapConfig = (): PublicCityMapConfig => ({
  styleUrl: CITY_MAP_STYLE_URL_DEFAULT,
  centerLng: CITY_MAP_CENTER_LNG_DEFAULT,
  centerLat: CITY_MAP_CENTER_LAT_DEFAULT,
  initialZoom: CITY_MAP_INITIAL_ZOOM_DEFAULT,
  initialPitch: CITY_MAP_INITIAL_PITCH_DEFAULT,
  initialBearing: CITY_MAP_INITIAL_BEARING_DEFAULT,
});
