import type { FilterSpecification, MapLibreMap } from 'maplibre-gl';

import {
  MODEL_FOOTPRINT_MASK_LAYER_ID,
  MODEL_FOOTPRINT_MASK_RADIUS_METERS,
  MODEL_FOOTPRINT_SOURCE_ID,
  OSM_BUILDING_EXTRUSION_LAYER_ID,
  OSM_BUILDING_HIDE_SCOPE_RADIUS_METERS,
} from '@/features/geo-map/constants';
import type { AdminOsmHideSession, GeoMapObject } from '@/features/geo-map/types';
import {
  buildOsmBuildingHideFilter,
  modelToOsmBuildingHideTarget,
} from '@/features/geo-map/utils/build-osm-building-extrusion-filter';
import {
  buildAdminOsmHideSignature,
  buildFootprintMaskSignature,
} from '@/features/geo-map/utils/geo-map-update-signatures';
import {
  collectPreservedOsmSiblingParts,
  syncPreservedOsmSiblingParts,
} from '@/features/geo-map/utils/sync-preserved-osm-parts';

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
 * Hides liberty `building-3d` extrusions under models via distance-scoped
 * identity (feature id / osm_id) with a tight distance fallback, and restores
 * MultiPolygon sibling rings so one hide never wipes a whole block.
 *
 * The filter is signature-guarded; sibling restoration always re-runs because
 * vector tiles may finish loading after the filter was applied (call this from
 * both React state changes and the map `idle` event).
 */
export const syncModelFootprintMasks = (
  map: MapLibreMap,
  modelObjects: readonly Pick<GeoMapObject, 'id' | 'longitude' | 'latitude' | 'sourceOsmId'>[],
  adminOsmHide?: AdminOsmHideSession | null,
): void => {
  if (!map.getLayer(OSM_BUILDING_EXTRUSION_LAYER_ID)) {
    return;
  }

  const signature = `${buildFootprintMaskSignature(modelObjects)}|${buildAdminOsmHideSignature(adminOsmHide)}`;
  if (lastMaskSignatureByMap.get(map) !== signature) {
    removeLegacyCoveragePads(map);

    const targets = [
      ...modelObjects.map(modelToOsmBuildingHideTarget),
      ...(adminOsmHide?.hiddenBuildings ?? []),
    ];
    const filter = buildOsmBuildingHideFilter(targets, {
      scopeRadiusMeters: OSM_BUILDING_HIDE_SCOPE_RADIUS_METERS,
      fallbackRadiusMeters: MODEL_FOOTPRINT_MASK_RADIUS_METERS,
    });

    map.setFilter(OSM_BUILDING_EXTRUSION_LAYER_ID, (filter ?? null) as FilterSpecification | null);
    lastMaskSignatureByMap.set(map, signature);
  }

  const preservedParts = collectPreservedOsmSiblingParts(
    map,
    modelObjects,
    adminOsmHide?.hiddenBuildings ?? [],
  );
  syncPreservedOsmSiblingParts(map, preservedParts);
};
