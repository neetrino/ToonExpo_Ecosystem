import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';

import {
  CITY_MAP_PIN_LAYER_ID,
  CITY_MAP_PIN_SELECTED_LAYER_ID,
  CITY_MAP_PIN_SOURCE_ID,
  type CityMapModelPose,
} from '../constants';
import {
  CITY_MAP_PIN_BRAND,
  CITY_MAP_PIN_IMAGE_ARCHIVED,
  CITY_MAP_PIN_IMAGE_DEFAULT,
  CITY_MAP_PIN_IMAGE_DRAFT,
  CITY_MAP_PIN_IMAGE_SELECTED,
  ensureCityMapPinImages,
} from './city-map-pin-icons';

export const CITY_MAP_PIN_HALO_LAYER_ID = 'city-map-pins-halo-layer';

const PIN_ICON_SIZE = 0.52;
const PIN_ICON_SIZE_SELECTED = 0.66;
const PIN_HALO_RADIUS = 12;
const PIN_HALO_OPACITY = 0.18;

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

const movePinLayersToTop = (map: MapLibreMap): void => {
  for (const layerId of [
    CITY_MAP_PIN_HALO_LAYER_ID,
    CITY_MAP_PIN_LAYER_ID,
    CITY_MAP_PIN_SELECTED_LAYER_ID,
  ]) {
    if (map.getLayer(layerId)) {
      map.moveLayer(layerId);
    }
  }
};

export const ensureCityMapPinLayers = (map: MapLibreMap): void => {
  ensureCityMapPinImages(map);

  if (!map.getSource(CITY_MAP_PIN_SOURCE_ID)) {
    map.addSource(CITY_MAP_PIN_SOURCE_ID, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
  }

  if (!map.getLayer(CITY_MAP_PIN_HALO_LAYER_ID)) {
    map.addLayer({
      id: CITY_MAP_PIN_HALO_LAYER_ID,
      type: 'circle',
      source: CITY_MAP_PIN_SOURCE_ID,
      paint: {
        'circle-radius': PIN_HALO_RADIUS,
        'circle-color': CITY_MAP_PIN_BRAND,
        'circle-opacity': PIN_HALO_OPACITY,
        'circle-blur': 0.75,
        'circle-pitch-alignment': 'viewport',
        'circle-pitch-scale': 'viewport',
        'circle-translate': [0, -8],
        'circle-translate-anchor': 'viewport',
      },
    });
  }

  if (!map.getLayer(CITY_MAP_PIN_LAYER_ID)) {
    map.addLayer({
      id: CITY_MAP_PIN_LAYER_ID,
      type: 'symbol',
      source: CITY_MAP_PIN_SOURCE_ID,
      layout: {
        'icon-image': [
          'match',
          ['get', 'publicationStatus'],
          'draft',
          CITY_MAP_PIN_IMAGE_DRAFT,
          'archived',
          CITY_MAP_PIN_IMAGE_ARCHIVED,
          CITY_MAP_PIN_IMAGE_DEFAULT,
        ],
        'icon-size': PIN_ICON_SIZE,
        'icon-anchor': 'bottom',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'symbol-sort-key': ['match', ['get', 'publicationStatus'], 'draft', 1, 'archived', 0, 2],
      },
    });
  }

  if (!map.getLayer(CITY_MAP_PIN_SELECTED_LAYER_ID)) {
    map.addLayer({
      id: CITY_MAP_PIN_SELECTED_LAYER_ID,
      type: 'symbol',
      source: CITY_MAP_PIN_SOURCE_ID,
      filter: ['==', ['get', 'id'], ''],
      layout: {
        'icon-image': CITY_MAP_PIN_IMAGE_SELECTED,
        'icon-size': PIN_ICON_SIZE_SELECTED,
        'icon-anchor': 'bottom',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
    });
  }

  movePinLayersToTop(map);
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
  const selectedId = placementId ?? '';
  map.setFilter(CITY_MAP_PIN_SELECTED_LAYER_ID, ['==', ['get', 'id'], selectedId]);

  if (selectedId) {
    if (map.getLayer(CITY_MAP_PIN_LAYER_ID)) {
      map.setFilter(CITY_MAP_PIN_LAYER_ID, ['!=', ['get', 'id'], selectedId]);
    }
    if (map.getLayer(CITY_MAP_PIN_HALO_LAYER_ID)) {
      map.setFilter(CITY_MAP_PIN_HALO_LAYER_ID, ['!=', ['get', 'id'], selectedId]);
    }
    return;
  }

  if (map.getLayer(CITY_MAP_PIN_LAYER_ID)) {
    map.setFilter(CITY_MAP_PIN_LAYER_ID, null);
  }
  if (map.getLayer(CITY_MAP_PIN_HALO_LAYER_ID)) {
    map.setFilter(CITY_MAP_PIN_HALO_LAYER_ID, null);
  }
};

export const removeCityMapPinLayers = (map: MapLibreMap): void => {
  for (const layerId of [
    CITY_MAP_PIN_SELECTED_LAYER_ID,
    CITY_MAP_PIN_LAYER_ID,
    CITY_MAP_PIN_HALO_LAYER_ID,
  ]) {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
  }
  if (map.getSource(CITY_MAP_PIN_SOURCE_ID)) {
    map.removeSource(CITY_MAP_PIN_SOURCE_ID);
  }
};
