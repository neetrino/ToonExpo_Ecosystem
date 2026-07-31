'use client';

import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef } from 'react';
import * as Sentry from '@sentry/nextjs';

import type { PublicCityMapConfig } from '@toonexpo/contracts';

import { cn } from '@/shared/ui/cn';

import {
  CITY_MAP_DEFAULT_CONFIG,
  CITY_MAP_MAPLIBRE_WORKER_URL,
  CITY_MAP_PIN_FOCUS_ZOOM,
  CITY_MAP_PIN_LAYER_ID,
  CITY_MAP_PIN_SELECTED_LAYER_ID,
  type CityMapModelPose,
} from '../constants';
import { createCityMapGlbLayer, type CityMapGlbLayerHandle } from './city-map-glb-layer';
import { fitCityMapToPinPoses } from './city-map-fit-pins';
import { bindCityMapMissingImageHandler } from './city-map-missing-images';
import { bindCityMapPinInteractions } from './city-map-pin-interactions';
import {
  ensureCityMapPinLayers,
  removeCityMapPinLayers,
  setCityMapPins,
  setSelectedCityMapPin,
} from './city-map-pins';
import {
  applyCityMapRecenter,
  CityMapRecenterControl,
  resolveCityMapRecenterTarget,
} from './city-map-recenter';

export type CityMapViewMode = 'edit' | 'view';

type CityMapViewProps = {
  mode: CityMapViewMode;
  className?: string;
  config?: PublicCityMapConfig | null;
  models: CityMapModelPose[];
  selectedPlacementId?: string | null;
  flyToPlacementId?: string | null;
  onSelectPlacement?: (placementId: string, projectId: string) => void;
  /** When set, clicking the already-selected pin clears selection instead of re-selecting. */
  onDeselectPlacement?: () => void;
  onMapClick?: (lng: number, lat: number) => void;
  onReady?: (map: MapLibreMap) => void;
  onError?: (message: string) => void;
};

const VIEWPORT_PIN_SYNC_THRESHOLD = 0.05;

let maplibreWorkerConfigured = false;

const ensureMaplibreWorker = (): void => {
  if (maplibreWorkerConfigured) {
    return;
  }
  maplibregl.setWorkerUrl(CITY_MAP_MAPLIBRE_WORKER_URL);
  maplibreWorkerConfigured = true;
};

export const CityMapView = ({
  mode,
  className,
  config,
  models,
  selectedPlacementId = null,
  flyToPlacementId = null,
  onSelectPlacement,
  onDeselectPlacement,
  onMapClick,
  onReady,
  onError,
}: CityMapViewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const layerRef = useRef<CityMapGlbLayerHandle | null>(null);
  const modelsRef = useRef(models);
  const selectedPlacementIdRef = useRef(selectedPlacementId);
  const onSelectRef = useRef(onSelectPlacement);
  const onDeselectRef = useRef(onDeselectPlacement);
  const onClickRef = useRef(onMapClick);
  const didFitPinsRef = useRef(false);

  modelsRef.current = models;
  selectedPlacementIdRef.current = selectedPlacementId;
  onSelectRef.current = onSelectPlacement;
  onDeselectRef.current = onDeselectPlacement;
  onClickRef.current = onMapClick;

  useEffect(() => {
    didFitPinsRef.current = false;
  }, [models.length]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const mapConfig = config ?? CITY_MAP_DEFAULT_CONFIG;
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let visibilityObserver: IntersectionObserver | null = null;
    let unbindMissingImages: (() => void) | null = null;
    let unbindPinInteractions: (() => void) | null = null;

    const syncPinsFromRef = (map: MapLibreMap): void => {
      if (!map.isStyleLoaded()) {
        return;
      }
      layerRef.current?.setModels(modelsRef.current);
      setCityMapPins(map, modelsRef.current);
      setSelectedCityMapPin(map, selectedPlacementIdRef.current);
      if (!didFitPinsRef.current && fitCityMapToPinPoses(map, modelsRef.current)) {
        didFitPinsRef.current = true;
      }
    };

    try {
      ensureMaplibreWorker();
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: mapConfig.styleUrl,
        center: [mapConfig.centerLng, mapConfig.centerLat],
        zoom: mapConfig.initialZoom,
        pitch: mapConfig.initialPitch,
        bearing: mapConfig.initialBearing,
        attributionControl: {},
      });
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
      map.addControl(
        new CityMapRecenterControl({
          onRecenter: () => {
            const activeMap = mapRef.current;
            if (!activeMap) {
              return;
            }
            applyCityMapRecenter(
              activeMap,
              resolveCityMapRecenterTarget(modelsRef.current, selectedPlacementIdRef.current),
            );
          },
        }),
        'top-right',
      );
      unbindMissingImages = bindCityMapMissingImageHandler(map);
      mapRef.current = map;

      resizeObserver = new ResizeObserver(() => {
        map.resize();
      });
      resizeObserver.observe(containerRef.current);

      visibilityObserver = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) {
            return;
          }
          map.resize();
          syncPinsFromRef(map);
        },
        { threshold: VIEWPORT_PIN_SYNC_THRESHOLD },
      );
      visibilityObserver.observe(containerRef.current);

      map.on('load', () => {
        if (cancelled) {
          return;
        }
        map.resize();
        layerRef.current = createCityMapGlbLayer(map);
        ensureCityMapPinLayers(map);
        syncPinsFromRef(map);
        onReady?.(map);
      });

      map.on('error', (event) => {
        const message = event.error?.message ?? 'Map failed to load';
        Sentry.captureMessage(`CityMapView: ${message}`, { level: 'warning' });
      });

      unbindPinInteractions = bindCityMapPinInteractions(map, (placementId, projectId) => {
        if (onDeselectRef.current && selectedPlacementIdRef.current === placementId) {
          onDeselectRef.current();
          return;
        }
        onSelectRef.current?.(placementId, projectId);
      });

      map.on('click', (event) => {
        if (mode !== 'edit') {
          return;
        }
        const features = map.queryRenderedFeatures(event.point, {
          layers: [CITY_MAP_PIN_LAYER_ID, CITY_MAP_PIN_SELECTED_LAYER_ID],
        });
        if (features.length > 0) {
          return;
        }
        onClickRef.current?.(event.lngLat.lng, event.lngLat.lat);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Map init failed';
      Sentry.captureException(error);
      onError?.(message);
    }

    return () => {
      cancelled = true;
      unbindMissingImages?.();
      unbindPinInteractions?.();
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      layerRef.current?.destroy();
      layerRef.current = null;
      if (mapRef.current) {
        removeCityMapPinLayers(mapRef.current);
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const applyModels = (): void => {
      if (!map.isStyleLoaded()) {
        return;
      }
      layerRef.current?.setModels(models);
      setCityMapPins(map, models);
      if (!didFitPinsRef.current && fitCityMapToPinPoses(map, models)) {
        didFitPinsRef.current = true;
      }
    };

    applyModels();
    if (map.isStyleLoaded()) {
      return;
    }
    map.once('load', applyModels);
    return () => {
      map.off('load', applyModels);
    };
  }, [models]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) {
      return;
    }
    setSelectedCityMapPin(map, selectedPlacementId);
  }, [selectedPlacementId, models]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToPlacementId) {
      return;
    }
    const target = models.find((model) => model.id === flyToPlacementId);
    if (!target) {
      return;
    }
    map.flyTo({
      center: [target.longitude, target.latitude],
      zoom: Math.max(map.getZoom(), CITY_MAP_PIN_FOCUS_ZOOM),
      essential: true,
    });
  }, [flyToPlacementId, models]);

  return (
    <div
      ref={containerRef}
      data-testid="city-map-view"
      className={cn('relative h-full min-h-80 w-full overflow-hidden', className)}
    />
  );
};
