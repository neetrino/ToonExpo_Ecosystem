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
  CITY_MAP_PIN_LAYER_ID,
  type CityMapModelPose,
} from '../constants';
import { createCityMapGlbLayer, type CityMapGlbLayerHandle } from './city-map-glb-layer';
import {
  ensureCityMapPinLayers,
  removeCityMapPinLayers,
  setCityMapPins,
  setSelectedCityMapPin,
} from './city-map-pins';

export type CityMapViewMode = 'edit' | 'view';

type CityMapViewProps = {
  mode: CityMapViewMode;
  className?: string;
  config?: PublicCityMapConfig | null;
  models: CityMapModelPose[];
  selectedPlacementId?: string | null;
  selectedProjectId?: string | null;
  flyToPlacementId?: string | null;
  onSelectPlacement?: (placementId: string, projectId: string) => void;
  onMapClick?: (lng: number, lat: number) => void;
  onReady?: (map: MapLibreMap) => void;
  onError?: (message: string) => void;
};

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
  selectedProjectId = null,
  flyToPlacementId = null,
  onSelectPlacement,
  onMapClick,
  onReady,
  onError,
}: CityMapViewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const layerRef = useRef<CityMapGlbLayerHandle | null>(null);
  const modelsRef = useRef(models);
  const onSelectRef = useRef(onSelectPlacement);
  const onClickRef = useRef(onMapClick);

  modelsRef.current = models;
  onSelectRef.current = onSelectPlacement;
  onClickRef.current = onMapClick;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const mapConfig = config ?? CITY_MAP_DEFAULT_CONFIG;
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

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
      mapRef.current = map;

      resizeObserver = new ResizeObserver(() => {
        map.resize();
      });
      resizeObserver.observe(containerRef.current);

      map.on('load', () => {
        if (cancelled) {
          return;
        }
        map.resize();
        ensureCityMapPinLayers(map);
        layerRef.current = createCityMapGlbLayer(map);
        layerRef.current.setModels(modelsRef.current);
        setCityMapPins(map, modelsRef.current);
        onReady?.(map);
      });

      map.on('error', (event) => {
        const message = event.error?.message ?? 'Map failed to load';
        Sentry.captureMessage(`CityMapView: ${message}`, { level: 'warning' });
        onError?.(message);
      });

      map.on('click', CITY_MAP_PIN_LAYER_ID, (event) => {
        const feature = event.features?.[0];
        const placementId = feature?.properties?.['id'];
        const projectId = feature?.properties?.['projectId'];
        if (typeof placementId === 'string' && typeof projectId === 'string') {
          onSelectRef.current?.(placementId, projectId);
        }
      });

      map.on('click', (event) => {
        if (mode !== 'edit') {
          return;
        }
        const features = map.queryRenderedFeatures(event.point, {
          layers: [CITY_MAP_PIN_LAYER_ID],
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
      resizeObserver?.disconnect();
      layerRef.current?.destroy();
      layerRef.current = null;
      if (mapRef.current) {
        removeCityMapPinLayers(mapRef.current);
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) {
      return;
    }
    layerRef.current?.setModels(models);
    setCityMapPins(map, models);
  }, [models]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    let placementId = selectedPlacementId;
    if (!placementId && selectedProjectId) {
      const first = models.find((model) => model.projectId === selectedProjectId);
      placementId = first?.id ?? null;
    }
    setSelectedCityMapPin(map, placementId);
  }, [selectedPlacementId, selectedProjectId, models]);

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
      zoom: Math.max(map.getZoom(), 16),
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
