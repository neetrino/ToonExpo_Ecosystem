import type { MapLibreMap } from 'maplibre-gl';

import { generateGrassForPark } from '@/features/geo-map/vegetation/build-grass-layout';
import { generateTreesForPark } from '@/features/geo-map/vegetation/build-tree-layout';
import {
  DEFAULT_GRASS_CONFIG,
  GRASS_MIN_PITCH_DEG,
  GRASS_QUALITY,
  type GrassConfig,
} from '@/features/geo-map/vegetation/grass-config';
import { hideParkTreeSymbols } from '@/features/geo-map/vegetation/hide-park-tree-symbols';
import { listViewportGreenParks } from '@/features/geo-map/vegetation/list-viewport-parks';
import { collectExclusions } from '@/features/geo-map/vegetation/tree-collision-filter';
import type {
  GrassInstanceSpec,
  TreeInstanceSpec,
  VegetationConfig,
  VegetationQualityId,
} from '@/features/geo-map/vegetation/types';
import {
  DEFAULT_VEGETATION_CONFIG,
  VEGETATION_DISCOVER_DEBOUNCE_MS,
  VEGETATION_MAX_VIEWPORT_PARKS,
  VEGETATION_MIN_PITCH_DEG,
  VEGETATION_QUALITY,
  pickVegetationQuality,
} from '@/features/geo-map/vegetation/vegetation-config';
import {
  ensureVegetationLayer,
  removeVegetationLayer,
  type VegetationLayer,
} from '@/features/geo-map/three/vegetation-layer';

export type VegetationHandle = {
  destroy: () => void;
};

/**
 * Discovers viewport parks, caches trees/grass per park id, publishes capped
 * instances to the Three.js vegetation layer on moveend / idle.
 */
export const attachVegetation = (map: MapLibreMap): VegetationHandle => {
  let destroyed = false;
  let layer: VegetationLayer | null = ensureVegetationLayer(map);
  let discoverTimer: ReturnType<typeof setTimeout> | null = null;
  const quality: VegetationQualityId = pickVegetationQuality();
  const config: VegetationConfig = { ...DEFAULT_VEGETATION_CONFIG };
  const grassConfig: GrassConfig = { ...DEFAULT_GRASS_CONFIG };
  const parkCache = new Map<string, TreeInstanceSpec[]>();
  const grassCache = new Map<string, GrassInstanceSpec[]>();
  let bootstrapped = false;

  hideParkTreeSymbols(map);

  const treeCap = (): number => VEGETATION_QUALITY[quality].maxInstances;
  const grassCap = (): number => GRASS_QUALITY[quality].maxInstances;

  const treesVisible = (): boolean =>
    config.enabled && map.getZoom() >= config.minZoom && map.getPitch() >= VEGETATION_MIN_PITCH_DEG;

  const grassVisible = (): boolean =>
    treesVisible() &&
    grassConfig.enabled &&
    map.getZoom() >= grassConfig.minZoom &&
    map.getPitch() >= GRASS_MIN_PITCH_DEG;

  const publish = (viewportIds: string[]): void => {
    if (!layer) {
      return;
    }
    const trees = collectFromCache(parkCache, viewportIds, treeCap());
    const blades = collectFromCache(grassCache, viewportIds, grassCap());
    const showTrees = treesVisible();
    const showGrass = grassVisible();
    layer.setGroundOffset(config.groundOffsetMeters);
    layer.setInstances(showTrees ? trees : []);
    layer.setGrassInstances(showTrees && showGrass ? blades : []);
    layer.setEnabled(showTrees);
    layer.setGrassVisible(showGrass);
    map.triggerRepaint();
  };

  const discover = (): void => {
    if (destroyed || !layer || !config.enabled) {
      return;
    }
    const parks = listViewportGreenParks(map).slice(0, VEGETATION_MAX_VIEWPORT_PARKS);
    const viewportIds = parks.map((park) => park.id);
    if (parks.length === 0) {
      syncVisibility();
      return;
    }

    const preset = VEGETATION_QUALITY[quality];
    let changed = false;
    for (const park of parks) {
      if (parkCache.has(park.id) && grassCache.has(park.id)) {
        continue;
      }
      const exclusions = collectExclusions(map, park.centroid);
      if (!parkCache.has(park.id)) {
        const { instances } = generateTreesForPark(
          park,
          config,
          preset,
          exclusions,
          park.centroid,
          Math.max(config.maxTreesPerFeature, treeCap()),
        );
        if (instances.length > 0) {
          parkCache.set(park.id, instances);
          changed = true;
        }
      }
      if (!grassCache.has(park.id) && grassConfig.enabled) {
        const { instances } = generateGrassForPark(
          park,
          grassConfig,
          quality,
          exclusions,
          park.centroid,
          Math.max(grassConfig.maxBladesPerFeature, grassCap()),
        );
        if (instances.length > 0) {
          grassCache.set(park.id, instances);
          changed = true;
        }
      }
    }

    if (changed || !bootstrapped || viewportIds.length > 0) {
      bootstrapped = true;
      publish(viewportIds);
    }
    syncVisibility();
  };

  const scheduleDiscover = (): void => {
    if (discoverTimer) {
      clearTimeout(discoverTimer);
    }
    discoverTimer = setTimeout(() => {
      discoverTimer = null;
      discover();
    }, VEGETATION_DISCOVER_DEBOUNCE_MS);
  };

  const syncVisibility = (): void => {
    if (!layer) {
      return;
    }
    const showTrees = treesVisible();
    const showGrass = grassVisible();
    layer.setEnabled(showTrees);
    layer.setGrassVisible(showGrass);
    map.triggerRepaint();
  };

  const onMoveEnd = (): void => {
    scheduleDiscover();
  };

  const onZoomEnd = (): void => {
    syncVisibility();
    if (bootstrapped) {
      const parks = listViewportGreenParks(map).slice(0, VEGETATION_MAX_VIEWPORT_PARKS);
      publish(parks.map((park) => park.id));
    }
    scheduleDiscover();
  };

  const onPitch = (): void => {
    syncVisibility();
  };

  const onSourceData = (event: { isSourceLoaded?: boolean }): void => {
    if (!event.isSourceLoaded) {
      return;
    }
    hideParkTreeSymbols(map);
    scheduleDiscover();
  };

  map.on('moveend', onMoveEnd);
  map.on('zoomend', onZoomEnd);
  map.on('pitch', onPitch);
  map.on('pitchend', onPitch);
  map.on('sourcedata', onSourceData);
  scheduleDiscover();

  return {
    destroy: () => {
      destroyed = true;
      if (discoverTimer) {
        clearTimeout(discoverTimer);
      }
      map.off('moveend', onMoveEnd);
      map.off('zoomend', onZoomEnd);
      map.off('pitch', onPitch);
      map.off('pitchend', onPitch);
      map.off('sourcedata', onSourceData);
      parkCache.clear();
      grassCache.clear();
      removeVegetationLayer(map);
      layer = null;
    },
  };
};

const collectFromCache = <T>(cache: Map<string, T[]>, preferredIds: string[], cap: number): T[] => {
  const selected: T[] = [];
  const seen = new Set<string>();
  const push = (id: string): void => {
    if (seen.has(id) || selected.length >= cap) {
      return;
    }
    const items = cache.get(id);
    if (!items || items.length === 0) {
      return;
    }
    seen.add(id);
    for (const item of items) {
      if (selected.length >= cap) {
        break;
      }
      selected.push(item);
    }
  };
  for (const id of preferredIds) {
    push(id);
  }
  for (const id of cache.keys()) {
    push(id);
  }
  return selected;
};
