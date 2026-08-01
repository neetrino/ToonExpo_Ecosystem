import type { MapLibreMap } from 'maplibre-gl';

import {
  OSM_BUILDING_EXTRUSION_LAYER_ID,
  OSM_BUILDING_EXTRUSION_MIN_ZOOM,
  OSM_BUILDING_FILL_LAYER_ID,
} from '@/features/geo-map/constants';
import {
  BRAND_MAP_BACKGROUND,
  BRAND_MAP_BUILDING_EXTRUSION_OPACITY,
  BRAND_MAP_BUILDING_EXTRUSION_TOP,
  BRAND_MAP_BUILDING_FILL,
  BRAND_MAP_BUILDING_FILL_OPACITY,
  BRAND_MAP_GRASS,
  BRAND_MAP_LABEL_HALO,
  BRAND_MAP_LABEL_TEXT,
  BRAND_MAP_LANDUSE_RESIDENTIAL,
  BRAND_MAP_PARK,
  BRAND_MAP_ROAD_CASING,
  BRAND_MAP_ROAD_MAJOR,
  BRAND_MAP_ROAD_MINOR,
  BRAND_MAP_ROAD_MOTORWAY,
  BRAND_MAP_WATER_FILL,
  BRAND_MAP_WATERWAY,
  BRAND_MAP_WOOD,
} from '@/features/geo-map/utils/brand-map-style-constants';

type BrandPaintProperty =
  | 'background-color'
  | 'fill-color'
  | 'fill-opacity'
  | 'line-color'
  | 'text-color'
  | 'text-halo-color'
  | 'fill-extrusion-color'
  | 'fill-extrusion-opacity'
  | 'fill-extrusion-vertical-gradient';

type PaintOverride = {
  layerId: string;
  property: BrandPaintProperty;
  value: string | number | boolean;
};

/** Fill / line / background paint overrides applied to liberty layer ids. */
export const BRAND_MAP_PAINT_OVERRIDES: readonly PaintOverride[] = [
  { layerId: 'background', property: 'background-color', value: BRAND_MAP_BACKGROUND },
  { layerId: 'park', property: 'fill-color', value: BRAND_MAP_PARK },
  { layerId: 'landcover_wood', property: 'fill-color', value: BRAND_MAP_WOOD },
  { layerId: 'landcover_grass', property: 'fill-color', value: BRAND_MAP_GRASS },
  { layerId: 'landuse_residential', property: 'fill-color', value: BRAND_MAP_LANDUSE_RESIDENTIAL },
  { layerId: 'water', property: 'fill-color', value: BRAND_MAP_WATER_FILL },
  { layerId: 'waterway_river', property: 'line-color', value: BRAND_MAP_WATERWAY },
  { layerId: 'waterway_other', property: 'line-color', value: BRAND_MAP_WATERWAY },
  { layerId: 'road_minor_casing', property: 'line-color', value: BRAND_MAP_ROAD_CASING },
  {
    layerId: 'road_secondary_tertiary_casing',
    property: 'line-color',
    value: BRAND_MAP_ROAD_CASING,
  },
  { layerId: 'road_trunk_primary_casing', property: 'line-color', value: BRAND_MAP_ROAD_CASING },
  { layerId: 'road_motorway_casing', property: 'line-color', value: BRAND_MAP_ROAD_CASING },
  { layerId: 'road_minor', property: 'line-color', value: BRAND_MAP_ROAD_MINOR },
  { layerId: 'road_secondary_tertiary', property: 'line-color', value: BRAND_MAP_ROAD_MAJOR },
  { layerId: 'road_trunk_primary', property: 'line-color', value: BRAND_MAP_ROAD_MAJOR },
  { layerId: 'road_motorway', property: 'line-color', value: BRAND_MAP_ROAD_MOTORWAY },
  { layerId: 'bridge_street_casing', property: 'line-color', value: BRAND_MAP_ROAD_CASING },
  { layerId: 'bridge_street', property: 'line-color', value: BRAND_MAP_ROAD_MINOR },
  { layerId: 'bridge_secondary_tertiary', property: 'line-color', value: BRAND_MAP_ROAD_MAJOR },
  { layerId: 'bridge_trunk_primary', property: 'line-color', value: BRAND_MAP_ROAD_MAJOR },
  { layerId: 'bridge_motorway', property: 'line-color', value: BRAND_MAP_ROAD_MOTORWAY },
  { layerId: OSM_BUILDING_FILL_LAYER_ID, property: 'fill-color', value: BRAND_MAP_BUILDING_FILL },
  {
    layerId: OSM_BUILDING_FILL_LAYER_ID,
    property: 'fill-opacity',
    value: BRAND_MAP_BUILDING_FILL_OPACITY,
  },
];

const LABEL_TEXT_LAYER_IDS = [
  'highway-name-path',
  'highway-name-minor',
  'highway-name-major',
  'waterway_line_label',
  'water_name_point_label',
  'water_name_line_label',
  'label_other',
  'label_village',
  'label_town',
  'label_city',
  'label_city_capital',
] as const;

const setPaintIfLayerExists = (
  map: MapLibreMap,
  layerId: string,
  property: BrandPaintProperty,
  value: string | number | boolean,
): void => {
  if (!map.getLayer(layerId)) {
    return;
  }
  map.setPaintProperty(layerId, property, value);
};

const applyLabelColors = (map: MapLibreMap): void => {
  for (const layerId of LABEL_TEXT_LAYER_IDS) {
    setPaintIfLayerExists(map, layerId, 'text-color', BRAND_MAP_LABEL_TEXT);
    setPaintIfLayerExists(map, layerId, 'text-halo-color', BRAND_MAP_LABEL_HALO);
  }
};

const applyBuildingExtrusionStyle = (map: MapLibreMap): void => {
  if (!map.getLayer(OSM_BUILDING_EXTRUSION_LAYER_ID)) {
    return;
  }

  map.setLayerZoomRange(OSM_BUILDING_EXTRUSION_LAYER_ID, OSM_BUILDING_EXTRUSION_MIN_ZOOM, 24);
  setPaintIfLayerExists(
    map,
    OSM_BUILDING_EXTRUSION_LAYER_ID,
    'fill-extrusion-color',
    BRAND_MAP_BUILDING_EXTRUSION_TOP,
  );
  setPaintIfLayerExists(
    map,
    OSM_BUILDING_EXTRUSION_LAYER_ID,
    'fill-extrusion-opacity',
    BRAND_MAP_BUILDING_EXTRUSION_OPACITY,
  );
  setPaintIfLayerExists(
    map,
    OSM_BUILDING_EXTRUSION_LAYER_ID,
    'fill-extrusion-vertical-gradient',
    true,
  );
};

/**
 * Applies ToonExpo brand paint overrides to a loaded OpenFreeMap liberty style.
 * Keeps attribution intact; only mutates paint / zoom-range on known layer ids.
 *
 * OSM boxes under GLBs are hidden by `syncModelFootprintMasks` (distance filter
 * on `building-3d`), not by paint overrides here.
 */
export const applyBrandMapStyle = (map: MapLibreMap): void => {
  for (const override of BRAND_MAP_PAINT_OVERRIDES) {
    setPaintIfLayerExists(map, override.layerId, override.property, override.value);
  }
  applyLabelColors(map);
  applyBuildingExtrusionStyle(map);
};
