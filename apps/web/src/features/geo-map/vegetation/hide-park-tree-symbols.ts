import type { FilterSpecification, MapLibreMap, StyleSpecification } from 'maplibre-gl';

const HIDE_CLASSES = ['park', 'garden', 'cemetery', 'playground', 'pitch'] as const;
const HIDE_SUBCLASSES = ['park', 'garden', 'tree', 'playground', 'pitch'] as const;
const POI_LAYER_IDS = ['poi_r1', 'poi_r7', 'poi_r20'] as const;

const originalFilters = new WeakMap<MapLibreMap, Map<string, FilterSpecification | null>>();

/**
 * Hide park/garden/playground/tree POI icons when 3D vegetation is active.
 */
export const hideParkTreeSymbols = (map: MapLibreMap): void => {
  if (!map.isStyleLoaded()) {
    return;
  }
  const style = map.getStyle() as StyleSpecification | undefined;
  if (!style?.layers) {
    return;
  }

  let cache = originalFilters.get(map);
  if (!cache) {
    cache = new Map();
    originalFilters.set(map, cache);
  }

  const exclusion: FilterSpecification = [
    '!',
    [
      'any',
      ['in', ['get', 'class'], ['literal', [...HIDE_CLASSES]]],
      ['in', ['get', 'subclass'], ['literal', [...HIDE_SUBCLASSES]]],
    ],
  ];

  for (const layer of style.layers) {
    if (layer.type !== 'symbol') {
      continue;
    }
    const id = layer.id;
    const isKnownPoi = (POI_LAYER_IDS as readonly string[]).includes(id);
    const looksLikePoi = id.toLowerCase().includes('poi');
    if (!isKnownPoi && !looksLikePoi) {
      continue;
    }

    try {
      if (!cache.has(id)) {
        cache.set(id, (map.getFilter(id) as FilterSpecification | null) ?? null);
      }
      const existing = cache.get(id) ?? null;
      const next = existing ? (['all', existing, exclusion] as FilterSpecification) : exclusion;
      map.setFilter(id, next);
    } catch {
      /* layer may not support filter mutation */
    }
  }
};
