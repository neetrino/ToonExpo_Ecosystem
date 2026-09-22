import type { MapLibreMap } from 'maplibre-gl';

import {
  OSM_BUILDING_EXTRUSION_LAYER_ID,
  OSM_BUILDING_FILL_LAYER_ID,
} from '@/features/geo-map/constants';
import { queryRenderedRings } from '@/features/geo-map/trees/query-rendered-rings';
import type { LngLatRing } from '@/features/geo-map/trees/types';

const WINDOW_BUILDING_LAYER_IDS = [
  OSM_BUILDING_EXTRUSION_LAYER_ID,
  OSM_BUILDING_FILL_LAYER_ID,
] as const;

/** Building footprints painted in the current window — trees must not sit on these. */
export const collectWindowBuildingRings = (map: MapLibreMap): LngLatRing[] =>
  queryRenderedRings(map, WINDOW_BUILDING_LAYER_IDS);
