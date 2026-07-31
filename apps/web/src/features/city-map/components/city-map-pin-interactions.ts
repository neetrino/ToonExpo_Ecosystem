import type { Map as MapLibreMap, MapLayerMouseEvent } from 'maplibre-gl';

import { CITY_MAP_PIN_LAYER_ID, CITY_MAP_PIN_SELECTED_LAYER_ID } from '../constants';

type PinClickHandler = (placementId: string, projectId: string) => void;

const readPinIds = (
  event: MapLayerMouseEvent,
): { placementId: string; projectId: string } | null => {
  const feature = event.features?.[0];
  const placementId = feature?.properties?.['id'];
  const projectId = feature?.properties?.['projectId'];
  if (typeof placementId !== 'string' || typeof projectId !== 'string') {
    return null;
  }
  return { placementId, projectId };
};

/**
 * Binds pin click + hover cursor. Returns cleanup.
 */
export const bindCityMapPinInteractions = (
  map: MapLibreMap,
  onPinClick: PinClickHandler,
): (() => void) => {
  const onLayerClick = (event: MapLayerMouseEvent): void => {
    const ids = readPinIds(event);
    if (ids) {
      onPinClick(ids.placementId, ids.projectId);
    }
  };

  const setPinCursor = (): void => {
    map.getCanvas().style.cursor = 'pointer';
  };
  const clearPinCursor = (): void => {
    map.getCanvas().style.cursor = '';
  };

  map.on('click', CITY_MAP_PIN_LAYER_ID, onLayerClick);
  map.on('click', CITY_MAP_PIN_SELECTED_LAYER_ID, onLayerClick);
  map.on('mouseenter', CITY_MAP_PIN_LAYER_ID, setPinCursor);
  map.on('mouseleave', CITY_MAP_PIN_LAYER_ID, clearPinCursor);
  map.on('mouseenter', CITY_MAP_PIN_SELECTED_LAYER_ID, setPinCursor);
  map.on('mouseleave', CITY_MAP_PIN_SELECTED_LAYER_ID, clearPinCursor);

  return () => {
    map.off('click', CITY_MAP_PIN_LAYER_ID, onLayerClick);
    map.off('click', CITY_MAP_PIN_SELECTED_LAYER_ID, onLayerClick);
    map.off('mouseenter', CITY_MAP_PIN_LAYER_ID, setPinCursor);
    map.off('mouseleave', CITY_MAP_PIN_LAYER_ID, clearPinCursor);
    map.off('mouseenter', CITY_MAP_PIN_SELECTED_LAYER_ID, setPinCursor);
    map.off('mouseleave', CITY_MAP_PIN_SELECTED_LAYER_ID, clearPinCursor);
  };
};
