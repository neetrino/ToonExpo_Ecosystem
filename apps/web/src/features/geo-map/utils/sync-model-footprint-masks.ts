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
  isPreservedOsmPartsSourceReady,
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
 * Sibling GeoJSON is synced first; the `building-3d` filter is applied only when
 * no siblings are required or the preserved-parts source is loaded — otherwise
 * the signature stays unset so the next map `idle` retry can apply it.
 */
export const syncModelFootprintMasks = (
  map: MapLibreMap,
  modelObjects: readonly Pick<GeoMapObject, 'id' | 'longitude' | 'latitude' | 'sourceOsmId'>[],
  adminOsmHide?: AdminOsmHideSession | null,
): void => {
  if (!map.getLayer(OSM_BUILDING_EXTRUSION_LAYER_ID)) {
    return;
  }

  const preservedParts = collectPreservedOsmSiblingParts(
    map,
    modelObjects,
    adminOsmHide?.hiddenBuildings ?? [],
  );
  syncPreservedOsmSiblingParts(map, preservedParts);

  const signature = `${buildFootprintMaskSignature(modelObjects)}|${buildAdminOsmHideSignature(adminOsmHide)}`;
  if (lastMaskSignatureByMap.get(map) === signature) {
    return;
  }

  removeLegacyCoveragePads(map);

  const targets = [
    ...modelObjects.map(modelToOsmBuildingHideTarget),
    ...(adminOsmHide?.hiddenBuildings ?? []),
  ];
  const filter = buildOsmBuildingHideFilter(targets, {
    scopeRadiusMeters: OSM_BUILDING_HIDE_SCOPE_RADIUS_METERS,
    fallbackRadiusMeters: MODEL_FOOTPRINT_MASK_RADIUS_METERS,
  });

  const canApplyFilter =
    preservedParts.length === 0 || isPreservedOsmPartsSourceReady(map);
  if (!canApplyFilter) {
    return;
  }

  map.setFilter(OSM_BUILDING_EXTRUSION_LAYER_ID, (filter ?? null) as FilterSpecification | null);
  lastMaskSignatureByMap.set(map, signature);
};
