import type { MapLibreMap } from 'maplibre-gl';

const SYMBOL_LAYER_HIDDEN = 'none' as const;

export type MapStyleLayerLike = {
  id: string;
  type?: string | undefined;
  layout?: { 'icon-image'?: unknown } | undefined;
};

/** Symbol layers that draw POI / stop / shield / oneway icons. */
export const listPoiSymbolLayerIds = (layers: readonly MapStyleLayerLike[]): string[] =>
  layers
    .filter((layer) => layer.type === 'symbol' && layer.layout?.['icon-image'] !== undefined)
    .map((layer) => layer.id);

/**
 * Hides amenity icons, bus stops, highway shields, and similar signs.
 * Street-name text layers (no `icon-image`) stay visible.
 */
export const hideMapPoiSymbolLayers = (map: MapLibreMap): void => {
  const layers = map.getStyle()?.layers;
  if (!layers) {
    return;
  }
  for (const layer of layers) {
    if (layer.type !== 'symbol' || layer.layout?.['icon-image'] === undefined) {
      continue;
    }
    if (!map.getLayer(layer.id)) {
      continue;
    }
    map.setLayoutProperty(layer.id, 'visibility', SYMBOL_LAYER_HIDDEN);
  }
};
