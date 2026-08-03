import type { LightSpecification, MapLibreMap, SkySpecification } from 'maplibre-gl';

import { OSM_BUILDING_EXTRUSION_LAYER_ID } from '@/features/geo-map/constants';
import {
  BRAND_MAP_BUILDING_EXTRUSION_OPACITY,
  BRAND_MAP_BUILDING_EXTRUSION_TOP,
} from '@/features/geo-map/utils/brand-map-style-constants';
import { realisticBuildingColorExpr } from '@/features/geo-map/utils/building-color-expr';
import {
  MAP_ATMOSPHERE_BLEND,
  MAP_ATMOSPHERE_FOG_COLOR,
  MAP_ATMOSPHERE_FOG_GROUND_BLEND,
  MAP_ATMOSPHERE_HORIZON_COLOR,
  MAP_ATMOSPHERE_HORIZON_FOG_BLEND,
  MAP_ATMOSPHERE_SKY_COLOR,
  MAP_ATMOSPHERE_SKY_HORIZON_BLEND,
  MAP_BUILDING_EXTRUSION_AO_INTENSITY,
  MAP_BUILDING_EXTRUSION_AO_RADIUS,
  MAP_LIGHT_ANCHOR,
  MAP_LIGHT_COLOR,
  MAP_LIGHT_INTENSITY,
  MAP_LIGHT_POSITION,
} from '@/features/geo-map/utils/map-atmosphere-constants';

const DAYTIME_SKY: SkySpecification = {
  'sky-color': MAP_ATMOSPHERE_SKY_COLOR,
  'sky-horizon-blend': MAP_ATMOSPHERE_SKY_HORIZON_BLEND,
  'horizon-color': MAP_ATMOSPHERE_HORIZON_COLOR,
  'horizon-fog-blend': MAP_ATMOSPHERE_HORIZON_FOG_BLEND,
  'fog-color': MAP_ATMOSPHERE_FOG_COLOR,
  'fog-ground-blend': MAP_ATMOSPHERE_FOG_GROUND_BLEND,
  'atmosphere-blend': MAP_ATMOSPHERE_BLEND,
};

const DAYTIME_LIGHT: LightSpecification = {
  anchor: MAP_LIGHT_ANCHOR,
  color: MAP_LIGHT_COLOR,
  intensity: MAP_LIGHT_INTENSITY,
  position: [...MAP_LIGHT_POSITION],
};

type ExtrusionPaintProperty =
  | 'fill-extrusion-color'
  | 'fill-extrusion-opacity'
  | 'fill-extrusion-vertical-gradient'
  | 'fill-extrusion-ambient-occlusion-intensity'
  | 'fill-extrusion-ambient-occlusion-radius';

const setExtrusionPaintSafe = (
  map: MapLibreMap,
  layerId: string,
  property: ExtrusionPaintProperty,
  value: string | number | boolean | ReturnType<typeof realisticBuildingColorExpr>,
): void => {
  try {
    // AO paint keys exist at runtime on recent MapLibre builds but are absent
    // from the published AllPaintProperties union in our typings.
    (map.setPaintProperty as (id: string, name: string, next: unknown) => void)(
      layerId,
      property,
      value,
    );
  } catch {
    /* property unsupported on this MapLibre / style build */
  }
};

const polishBuildingExtrusions = (map: MapLibreMap): void => {
  if (!map.getLayer(OSM_BUILDING_EXTRUSION_LAYER_ID)) {
    return;
  }
  const colorExpr = realisticBuildingColorExpr(BRAND_MAP_BUILDING_EXTRUSION_TOP);
  setExtrusionPaintSafe(map, OSM_BUILDING_EXTRUSION_LAYER_ID, 'fill-extrusion-color', colorExpr);
  setExtrusionPaintSafe(
    map,
    OSM_BUILDING_EXTRUSION_LAYER_ID,
    'fill-extrusion-opacity',
    BRAND_MAP_BUILDING_EXTRUSION_OPACITY,
  );
  setExtrusionPaintSafe(
    map,
    OSM_BUILDING_EXTRUSION_LAYER_ID,
    'fill-extrusion-vertical-gradient',
    true,
  );
  setExtrusionPaintSafe(
    map,
    OSM_BUILDING_EXTRUSION_LAYER_ID,
    'fill-extrusion-ambient-occlusion-intensity',
    MAP_BUILDING_EXTRUSION_AO_INTENSITY,
  );
  setExtrusionPaintSafe(
    map,
    OSM_BUILDING_EXTRUSION_LAYER_ID,
    'fill-extrusion-ambient-occlusion-radius',
    MAP_BUILDING_EXTRUSION_AO_RADIUS,
  );
};

/**
 * Applies daytime sky, fog, map light, and roof/side extrusion polish.
 * Safe on MapLibre v6 — sky/light failures are ignored when unsupported.
 */
export const applyMapAtmosphere = (map: MapLibreMap): void => {
  if (!map.isStyleLoaded()) {
    return;
  }

  try {
    map.setSky(DAYTIME_SKY);
  } catch {
    /* sky unsupported */
  }

  try {
    map.setLight(DAYTIME_LIGHT);
  } catch {
    /* light unsupported */
  }

  polishBuildingExtrusions(map);
  map.triggerRepaint();
};
