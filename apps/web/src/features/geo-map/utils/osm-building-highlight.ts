import type { FeatureCollection } from 'geojson';
import type { GeoJSONSource, MapLibreMap } from 'maplibre-gl';

import type { BuildingGeometry } from '@/features/geo-map/utils/building-identification';

export const OSM_HIGHLIGHT_SOURCE_ID = 'geo-map-osm-building-highlight';
export const OSM_HIGHLIGHT_FILL_LAYER_ID = 'geo-map-osm-building-highlight-fill';
export const OSM_HIGHLIGHT_LINE_LAYER_ID = 'geo-map-osm-building-highlight-line';

const HIGHLIGHT_FILL_COLOR = '#22d3ee';
const HIGHLIGHT_FILL_OPACITY = 0.35;
const HIGHLIGHT_LINE_COLOR = '#67e8f9';
const HIGHLIGHT_LINE_WIDTH = 3;

/** Last geometry successfully written to the highlight source (reference equality). */
const lastAppliedHighlightByMap = new WeakMap<MapLibreMap, BuildingGeometry | null>();

const emptyCollection = (): FeatureCollection => ({
  type: 'FeatureCollection',
  features: [],
});

/** Ensures cyan fill+outline GeoJSON layers used for admin OSM selection. */
export const ensureOsmHighlightLayers = (map: MapLibreMap): void => {
  if (!map.isStyleLoaded()) {
    return;
  }

  if (!map.getSource(OSM_HIGHLIGHT_SOURCE_ID)) {
    map.addSource(OSM_HIGHLIGHT_SOURCE_ID, {
      type: 'geojson',
      data: emptyCollection(),
    });
  }

  if (!map.getLayer(OSM_HIGHLIGHT_FILL_LAYER_ID)) {
    map.addLayer({
      id: OSM_HIGHLIGHT_FILL_LAYER_ID,
      type: 'fill',
      source: OSM_HIGHLIGHT_SOURCE_ID,
      paint: {
        'fill-color': HIGHLIGHT_FILL_COLOR,
        'fill-opacity': HIGHLIGHT_FILL_OPACITY,
      },
    });
  }

  if (!map.getLayer(OSM_HIGHLIGHT_LINE_LAYER_ID)) {
    map.addLayer({
      id: OSM_HIGHLIGHT_LINE_LAYER_ID,
      type: 'line',
      source: OSM_HIGHLIGHT_SOURCE_ID,
      paint: {
        'line-color': HIGHLIGHT_LINE_COLOR,
        'line-width': HIGHLIGHT_LINE_WIDTH,
      },
    });
  }
};

/**
 * Updates (or clears) the cyan OSM footprint highlight.
 * Skips when the requested geometry is reference-equal to the last applied
 * value. Early returns while the style is unloaded do not record, so idle
 * retries can succeed.
 */
export const setOsmHighlightedBuilding = (
  map: MapLibreMap,
  geometry: BuildingGeometry | null,
): void => {
  if (lastAppliedHighlightByMap.get(map) === geometry) {
    return;
  }
  if (!map.isStyleLoaded()) {
    return;
  }

  ensureOsmHighlightLayers(map);
  const source = map.getSource(OSM_HIGHLIGHT_SOURCE_ID) as GeoJSONSource | undefined;
  if (!source) {
    return;
  }

  if (!geometry) {
    source.setData(emptyCollection());
    lastAppliedHighlightByMap.set(map, null);
    return;
  }

  source.setData({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry,
      },
    ],
  });
  lastAppliedHighlightByMap.set(map, geometry);
};

/** Removes highlight layers/source (style reload / unmount cleanup). */
export const removeOsmHighlightLayers = (map: MapLibreMap): void => {
  lastAppliedHighlightByMap.delete(map);
  if (map.getLayer(OSM_HIGHLIGHT_LINE_LAYER_ID)) {
    map.removeLayer(OSM_HIGHLIGHT_LINE_LAYER_ID);
  }
  if (map.getLayer(OSM_HIGHLIGHT_FILL_LAYER_ID)) {
    map.removeLayer(OSM_HIGHLIGHT_FILL_LAYER_ID);
  }
  if (map.getSource(OSM_HIGHLIGHT_SOURCE_ID)) {
    map.removeSource(OSM_HIGHLIGHT_SOURCE_ID);
  }
};
