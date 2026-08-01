/** Public surface of the `geo-map` feature (Stage 2a — see `docs/3D-MAP-PLAN.md`). */

export { GeoMapCanvas } from './components/geo-map-canvas';
export { GeoMapCanvasLazy } from './components/geo-map-canvas-lazy';
export { GeoMapInfoCard } from './components/geo-map-info-card';
export { GeoMapWebglFallback } from './components/geo-map-webgl-fallback';

export {
  DEFAULT_MAP_CENTER_LATITUDE,
  DEFAULT_MAP_CENTER_LONGITUDE,
  DEFAULT_MAP_ZOOM,
  DEFAULT_MAP_STYLE_URL,
  DEFAULT_MODEL_MIN_ZOOM,
  MAP_STYLE_URL_ENV_VAR,
} from './constants';

export type { GeoMapCanvasProps, GeoMapFocusRequest, GeoMapLngLat, GeoMapObject } from './types';

export {
  mapAdminGeoMapItemToObject,
  mapAdminGeoMapItemsToObjects,
  mapPublicGeoMapItemToObject,
  mapPublicGeoMapItemsToObjects,
} from './utils/map-object-mapper';
export { resolveFocusCamera, findFocusObject } from './utils/resolve-focus-camera';
export { filterMapObjectsByLabel } from './utils/filter-map-objects-by-label';
export { resolveMapStyleUrl } from './utils/resolve-map-style-url';
