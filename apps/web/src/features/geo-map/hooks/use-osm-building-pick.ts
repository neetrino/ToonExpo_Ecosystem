'use client';

import type { MapGeoJSONFeature, MapLibreMap, MapMouseEvent } from 'maplibre-gl';
import { useEffect } from 'react';

import { OSM_BUILDING_EXTRUSION_LAYER_ID } from '@/features/geo-map/constants';
import {
  computeFootprintCenter,
  isBuildingGeometry,
  resolveSourceOsmId,
  type SelectedOsmBuilding,
} from '@/features/geo-map/utils/building-identification';
import {
  removeOsmHighlightLayers,
  setOsmHighlightedBuilding,
} from '@/features/geo-map/utils/osm-building-highlight';

export type UseOsmBuildingPickOptions = {
  map: MapLibreMap | null;
  isMapLoaded: boolean;
  /** Admin editor only — public maps must leave this false/undefined. */
  enabled: boolean;
  selectedBuilding: SelectedOsmBuilding | null;
  onSelect: (building: SelectedOsmBuilding) => void;
};

const toSelectedBuilding = (feature: MapGeoJSONFeature): SelectedOsmBuilding | null => {
  if (!isBuildingGeometry(feature.geometry)) {
    return null;
  }
  const [longitude, latitude] = computeFootprintCenter(feature.geometry);
  const properties =
    feature.properties && typeof feature.properties === 'object'
      ? (feature.properties as Record<string, unknown>)
      : null;

  return {
    sourceOsmId: resolveSourceOsmId(properties),
    longitude,
    latitude,
    geometry: feature.geometry,
  };
};

/**
 * Admin-only: click liberty `building-3d` → select footprint + cyan highlight.
 * Does not fire when the click hits a deck.gl / marker object (those stop map click).
 */
export const useOsmBuildingPick = ({
  map,
  isMapLoaded,
  enabled,
  selectedBuilding,
  onSelect,
}: UseOsmBuildingPickOptions): void => {
  useEffect(() => {
    if (!map || !isMapLoaded || !enabled) {
      return;
    }

    const handleClick = (event: MapMouseEvent): void => {
      if (!map.getLayer(OSM_BUILDING_EXTRUSION_LAYER_ID)) {
        return;
      }

      const features = map.queryRenderedFeatures(event.point, {
        layers: [OSM_BUILDING_EXTRUSION_LAYER_ID],
      });
      const feature = features[0];
      if (!feature) {
        return;
      }

      const selected = toSelectedBuilding(feature);
      if (!selected) {
        return;
      }

      event.preventDefault();
      onSelect(selected);
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, isMapLoaded, enabled, onSelect]);

  useEffect(() => {
    if (!map || !isMapLoaded || !enabled) {
      return;
    }
    setOsmHighlightedBuilding(map, selectedBuilding?.geometry ?? null);
  }, [map, isMapLoaded, enabled, selectedBuilding]);

  useEffect(() => {
    if (!map || !isMapLoaded || enabled) {
      return;
    }
    removeOsmHighlightLayers(map);
  }, [map, isMapLoaded, enabled]);

  useEffect(() => {
    if (!map) {
      return;
    }
    return () => {
      removeOsmHighlightLayers(map);
    };
  }, [map]);
};
