import type { MapLibreMap } from 'maplibre-gl';

import {
  VEHICLE_MAX_COUNT,
  VEHICLE_REDISCOVER_DEBOUNCE_MS,
} from '@/features/geo-map/traffic/traffic-config';
import type { RoadLine, Vehicle } from '@/features/geo-map/traffic/types';
import {
  createSparseVehicles,
  shouldAnimateVehicles,
  shouldShowVehicles,
  tickSparseVehicles,
} from '@/features/geo-map/traffic/vehicle-sim';
import { extractRoadsFromVectorTiles } from '@/features/geo-map/traffic/vector-roads';
import {
  ensureVehicleLayer,
  removeVehicleLayer,
  type VehicleLayer,
} from '@/features/geo-map/three/vehicle-layer';

export type TrafficHandle = {
  destroy: () => void;
};

/**
 * Sparse close-range traffic: vector-tile roads only, capped fleet, zoom-gated.
 */
export const attachTraffic = (map: MapLibreMap): TrafficHandle => {
  let destroyed = false;
  let layer: VehicleLayer | null = ensureVehicleLayer(map);
  let rediscoverTimer: ReturnType<typeof setTimeout> | null = null;
  let rafId: number | null = null;
  let lastTs = 0;
  let vehicles: Vehicle[] = [];
  let roadsById = new Map<string, RoadLine>();
  let tabVisible = typeof document === 'undefined' ? true : document.visibilityState === 'visible';

  const visibleNow = (): boolean => shouldShowVehicles(map.getZoom(), map.getPitch());
  const animateNow = (): boolean => shouldAnimateVehicles(map.getZoom());

  const publish = (): void => {
    if (!layer) {
      return;
    }
    const show = visibleNow();
    layer.setEnabled(show);
    layer.setVehicles(show ? vehicles : []);
    map.triggerRepaint();
  };

  const rediscover = (): void => {
    if (destroyed || !layer) {
      return;
    }
    if (!visibleNow()) {
      vehicles = [];
      roadsById = new Map();
      publish();
      stopLoop();
      return;
    }
    const roads = extractRoadsFromVectorTiles(map);
    roadsById = new Map(roads.map((road) => [road.id, road]));
    vehicles = createSparseVehicles(roads, VEHICLE_MAX_COUNT);
    publish();
    if (animateNow() && tabVisible) {
      startLoop();
    } else {
      stopLoop();
    }
  };

  const scheduleRediscover = (): void => {
    if (rediscoverTimer) {
      clearTimeout(rediscoverTimer);
    }
    rediscoverTimer = setTimeout(() => {
      rediscoverTimer = null;
      rediscover();
    }, VEHICLE_REDISCOVER_DEBOUNCE_MS);
  };

  const tick = (ts: number): void => {
    if (destroyed || !tabVisible || !animateNow() || !visibleNow()) {
      rafId = null;
      return;
    }
    const dt = lastTs === 0 ? 0 : Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    if (dt > 0) {
      tickSparseVehicles(vehicles, roadsById, dt);
      layer?.syncPoses();
      map.triggerRepaint();
    }
    rafId = requestAnimationFrame(tick);
  };

  const startLoop = (): void => {
    if (rafId !== null || destroyed) {
      return;
    }
    lastTs = 0;
    rafId = requestAnimationFrame(tick);
  };

  const stopLoop = (): void => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    lastTs = 0;
  };

  const onMoveEnd = (): void => {
    scheduleRediscover();
  };

  const onZoomOrPitch = (): void => {
    const show = visibleNow();
    layer?.setEnabled(show);
    if (!show) {
      stopLoop();
      return;
    }
    if (vehicles.length === 0) {
      scheduleRediscover();
      return;
    }
    if (animateNow() && tabVisible) {
      startLoop();
    } else {
      stopLoop();
      layer?.syncPoses();
      map.triggerRepaint();
    }
  };

  const onVisibility = (): void => {
    tabVisible = document.visibilityState === 'visible';
    if (!tabVisible) {
      stopLoop();
      return;
    }
    if (visibleNow() && animateNow()) {
      startLoop();
    }
  };

  map.on('moveend', onMoveEnd);
  map.on('zoomend', onZoomOrPitch);
  map.on('pitchend', onZoomOrPitch);
  document.addEventListener('visibilitychange', onVisibility);
  scheduleRediscover();

  return {
    destroy: () => {
      destroyed = true;
      if (rediscoverTimer) {
        clearTimeout(rediscoverTimer);
      }
      stopLoop();
      map.off('moveend', onMoveEnd);
      map.off('zoomend', onZoomOrPitch);
      map.off('pitchend', onZoomOrPitch);
      document.removeEventListener('visibilitychange', onVisibility);
      vehicles = [];
      roadsById = new Map();
      removeVehicleLayer(map);
      layer = null;
    },
  };
};
