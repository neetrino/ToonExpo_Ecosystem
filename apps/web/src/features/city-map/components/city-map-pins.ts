import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';

import {
  CITY_MAP_PIN_LAYER_ID,
  CITY_MAP_PIN_SELECTED_LAYER_ID,
  CITY_MAP_PIN_SOURCE_ID,
  type CityMapModelPose,
} from '../constants';

const PIN_COLOR_PUBLISHED = '#1f3a5f';
const PIN_COLOR_DRAFT = '#94a3b8';
const PIN_COLOR_ARCHIVED = '#64748b';
const PIN_COLOR_SELECTED = '#c45c26';

const toFeatureCollection = (
  poses: CityMapModelPose[],
): {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: Record<string, string>;
    geometry: { type: 'Point'; coordinates: [number, number] };
  }>;
} => ({
  type: 'FeatureCollection',
  features: poses.map((pose) => ({
    type: 'Feature',
    properties: {
      id: pose.id,
      projectId: pose.projectId,
      buildingId: pose.buildingId,
      label: pose.label,
      publicationStatus: pose.publicationStatus ?? 'published',
    },
    geometry: {
      type: 'Point',
      coordinates: [pose.longitude, pose.latitude],
    },
  })),
});

export const ensureCityMapPinLayers = (map: MapLibreMap): void => {
  if (!map.getSource(CITY_MAP_PIN_SOURCE_ID)) {
    map.addSource(CITY_MAP_PIN_SOURCE_ID, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
  }

  if (!map.getLayer(CITY_MAP_PIN_LAYER_ID)) {
    map.addLayer({
      id: CITY_MAP_PIN_LAYER_ID,
      type: 'circle',
      source: CITY_MAP_PIN_SOURCE_ID,
      paint: {
        'circle-radius': 7,
        'circle-color': [
          'match',
          ['get', 'publicationStatus'],
          'draft',
          PIN_COLOR_DRAFT,
          'archived',
          PIN_COLOR_ARCHIVED,
          PIN_COLOR_PUBLISHED,
        ],
        'circle-opacity': [
          'match',
          ['get', 'publicationStatus'],
          'draft',
          0.65,
          'archived',
          0.45,
          1,
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });
  }

  if (!map.getLayer(CITY_MAP_PIN_SELECTED_LAYER_ID)) {
    map.addLayer({
      id: CITY_MAP_PIN_SELECTED_LAYER_ID,
      type: 'circle',
      source: CITY_MAP_PIN_SOURCE_ID,
      filter: ['==', ['get', 'id'], ''],
      paint: {
        'circle-radius': 10,
        'circle-color': PIN_COLOR_SELECTED,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
      },
    });
  }
};

export const setCityMapPins = (map: MapLibreMap, poses: CityMapModelPose[]): void => {
  ensureCityMapPinLayers(map);
  const source = map.getSource(CITY_MAP_PIN_SOURCE_ID) as GeoJSONSource | undefined;
  source?.setData(toFeatureCollection(poses));
};

export const setSelectedCityMapPin = (map: MapLibreMap, placementId: string | null): void => {
  if (!map.getLayer(CITY_MAP_PIN_SELECTED_LAYER_ID)) {
    return;
  }
  map.setFilter(CITY_MAP_PIN_SELECTED_LAYER_ID, ['==', ['get', 'id'], placementId ?? '']);
};

export const removeCityMapPinLayers = (map: MapLibreMap): void => {
  if (map.getLayer(CITY_MAP_PIN_SELECTED_LAYER_ID)) {
    map.removeLayer(CITY_MAP_PIN_SELECTED_LAYER_ID);
  }
  if (map.getLayer(CITY_MAP_PIN_LAYER_ID)) {
    map.removeLayer(CITY_MAP_PIN_LAYER_ID);
  }
  if (map.getSource(CITY_MAP_PIN_SOURCE_ID)) {
    map.removeSource(CITY_MAP_PIN_SOURCE_ID);
  }
};
