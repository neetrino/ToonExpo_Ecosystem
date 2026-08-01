import type { FilterSpecification, MapLibreMap } from 'maplibre-gl';

import {
  MODEL_FOOTPRINT_MASK_LAYER_ID,
  MODEL_FOOTPRINT_MASK_RADIUS_METERS,
  MODEL_FOOTPRINT_SOURCE_ID,
  OSM_BUILDING_EXTRUSION_LAYER_ID,
} from '@/features/geo-map/constants';
import type { GeoMapObject } from '@/features/geo-map/types';
import { buildCombinedOsmBuildingExtrusionFilter } from '@/features/geo-map/utils/build-osm-building-extrusion-filter';
import { buildFootprintMaskSignature } from '@/features/geo-map/utils/geo-map-update-signatures';

const lastMaskSignatureByMap = new WeakMap<MapLibreMap, string>();

const removeLegacyCoveragePads = (map: MapLibreMap): void => {
  if (map.getLayer(MODEL_FOOTPRINT_MASK_LAYER_ID)) {
    map.removeLayer(MODEL_FOOTPRINT_MASK_LAYER_ID);
  }
  if (map.getSource(MODEL_FOOTPRINT_SOURCE_ID)) {
    map.removeSource(MODEL_FOOTPRINT_SOURCE_ID);
  }
};

/**
 * Hides liberty `building-3d` extrusions near visible models via distance and
 * optional `osm_id` exclusions when models store `sourceOsmId`.
 * Skips `setFilter` when the model id / position / osm_id signature is unchanged.
 */
export const syncModelFootprintMasks = (
  map: MapLibreMap,
  modelObjects: readonly Pick<GeoMapObject, 'id' | 'longitude' | 'latitude' | 'sourceOsmId'>[],
): void => {
  if (!map.getLayer(OSM_BUILDING_EXTRUSION_LAYER_ID)) {
    return;
  }

  const signature = buildFootprintMaskSignature(modelObjects);
  if (lastMaskSignatureByMap.get(map) === signature) {
    return;
  }

  removeLegacyCoveragePads(map);

  const filter = buildCombinedOsmBuildingExtrusionFilter(
    modelObjects,
    MODEL_FOOTPRINT_MASK_RADIUS_METERS,
  );

  map.setFilter(OSM_BUILDING_EXTRUSION_LAYER_ID, (filter ?? null) as FilterSpecification | null);
  lastMaskSignatureByMap.set(map, signature);
};
