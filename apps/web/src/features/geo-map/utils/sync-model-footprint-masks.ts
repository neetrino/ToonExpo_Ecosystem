import type { FilterSpecification, MapLibreMap } from 'maplibre-gl';

import {
  MODEL_FOOTPRINT_MASK_LAYER_ID,
  MODEL_FOOTPRINT_MASK_RADIUS_METERS,
  MODEL_FOOTPRINT_SOURCE_ID,
  OSM_BUILDING_EXTRUSION_LAYER_ID,
} from '@/features/geo-map/constants';
import type { GeoMapObject } from '@/features/geo-map/types';
import { buildOsmBuildingExtrusionFilter } from '@/features/geo-map/utils/build-osm-building-extrusion-filter';

const removeLegacyCoveragePads = (map: MapLibreMap): void => {
  if (map.getLayer(MODEL_FOOTPRINT_MASK_LAYER_ID)) {
    map.removeLayer(MODEL_FOOTPRINT_MASK_LAYER_ID);
  }
  if (map.getSource(MODEL_FOOTPRINT_SOURCE_ID)) {
    map.removeSource(MODEL_FOOTPRINT_SOURCE_ID);
  }
};

/**
 * Hides liberty `building-3d` extrusions within a radius of each visible model
 * anchor using MapLibre's `distance` expression filter.
 *
 * Coverage pads alone cannot subtract vector-tile extrusions (fill-extrusions
 * are hollow shells), so a distance filter is the reliable v1 approach.
 */
export const syncModelFootprintMasks = (
  map: MapLibreMap,
  modelObjects: readonly Pick<GeoMapObject, 'id' | 'longitude' | 'latitude'>[],
): void => {
  if (!map.getLayer(OSM_BUILDING_EXTRUSION_LAYER_ID)) {
    return;
  }

  removeLegacyCoveragePads(map);

  const filter = buildOsmBuildingExtrusionFilter(modelObjects, MODEL_FOOTPRINT_MASK_RADIUS_METERS);

  map.setFilter(OSM_BUILDING_EXTRUSION_LAYER_ID, (filter ?? null) as FilterSpecification | null);
};
