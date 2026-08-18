'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { GeoMapCameraControls } from '@/features/geo-map/components/geo-map-camera-controls';
import { GeoMapInfoCard } from '@/features/geo-map/components/geo-map-info-card';
import { GeoMapWebglFallback } from '@/features/geo-map/components/geo-map-webgl-fallback';
import { GeoMapAdminMapSelectionChrome } from '@/features/geo-map/admin/components/geo-map-admin-map-selection-chrome';
import {
  DEFAULT_MAP_BEARING_DEG,
  DEFAULT_MAP_CENTER_LATITUDE,
  DEFAULT_MAP_CENTER_LONGITUDE,
  DEFAULT_MAP_ZOOM,
  GEO_MAP_UI_OVERLAY_Z_INDEX_CLASS,
} from '@/features/geo-map/constants';
import { useDelayedHoverTarget } from '@/features/geo-map/hooks/use-delayed-hover-target';
import { useGeoMapEmptyClick } from '@/features/geo-map/hooks/use-geo-map-empty-click';
import { useMapAnchoredScreenPoint } from '@/features/geo-map/hooks/use-map-anchored-screen-point';
import { useMapFocus } from '@/features/geo-map/hooks/use-map-focus';
import { useMapViewRequest } from '@/features/geo-map/hooks/use-map-view-request';
import { useMapViewportState } from '@/features/geo-map/hooks/use-map-viewport-state';
import { useMaplibreMap } from '@/features/geo-map/hooks/use-maplibre-map';
import { useMarkerLayer } from '@/features/geo-map/hooks/use-marker-layer';
import { useModelFootprintMasks } from '@/features/geo-map/hooks/use-model-footprint-masks';
import { useOsmBuildingPick } from '@/features/geo-map/hooks/use-osm-building-pick';
import { useThreeBuildingLayer } from '@/features/geo-map/hooks/use-three-building-layer';
import { useVisibleObjects } from '@/features/geo-map/hooks/use-visible-objects';
import { useWebglSupport } from '@/features/geo-map/hooks/use-webgl-support';
import type { GeoMapCanvasProps, GeoMapLngLat, GeoMapObject } from '@/features/geo-map/types';
import type { ObjectTransformOverride } from '@/features/geo-map/utils/apply-position-override';
import { resolveInfoCardPlacement } from '@/features/geo-map/utils/resolve-info-card-placement';
import { resolveMapStyleUrl } from '@/features/geo-map/utils/resolve-map-style-url';

const DEFAULT_CENTER: GeoMapLngLat = {
  longitude: DEFAULT_MAP_CENTER_LONGITUDE,
  latitude: DEFAULT_MAP_CENTER_LATITUDE,
};

const findObjectById = (
  objects: readonly GeoMapObject[],
  id: string | null,
): GeoMapObject | null => {
  if (!id) {
    return null;
  }
  return objects.find((object) => object.id === id) ?? null;
};

/**
 * Reusable MapLibre + Three.js 3D map core (see `docs/3D-MAP-PLAN.md`).
 *
 * MapLibre owns basemap, OSM buildings, and camera. GLB models render via a
 * MapLibre Three.js custom layer (`ThreeBuildingLayer`) at/above each object's
 * `minZoom`, limited to the current viewport.
 *
 * Hover/select shows a shared logo + name info card. Optional `focusRequest`
 * flies the camera to an object without breaking read-only / editable consumers.
 *
 * Consumed by the admin editor (`editable`), the public map, and the home map.
 * Load via `next/dynamic` with `ssr: false` — see `GeoMapCanvasLazy`.
 */
export const GeoMapCanvas = ({
  objects,
  styleUrl,
  initialCenter = DEFAULT_CENTER,
  initialZoom = DEFAULT_MAP_ZOOM,
  initialPitch,
  initialBearing = DEFAULT_MAP_BEARING_DEG,
  editable = false,
  className,
  cameraControlsClassName,
  focusRequest,
  viewRequest,
  highlightedObjectId = null,
  onObjectClick,
  onObjectHover,
  onMapClick,
  onObjectDragged,
  transformOverride = null,
  selectedOsmBuilding = null,
  onOsmBuildingSelect,
  adminSelectionChrome = null,
  adminOsmHideSession = null,
}: GeoMapCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [uiOverlayRoot, setUiOverlayRoot] = useState<HTMLDivElement | null>(null);
  const isWebglSupported = useWebglSupport();
  const [dragOverride, setDragOverride] = useState<ObjectTransformOverride | null>(null);
  const hoverTarget = useDelayedHoverTarget();

  const { map, isMapLoaded } = useMaplibreMap({
    containerRef,
    styleUrl: styleUrl ?? resolveMapStyleUrl(),
    initialCenter,
    initialZoom,
    initialBearing,
    ...(initialPitch !== undefined ? { initialPitch } : {}),
  });
  const { zoom, bounds } = useMapViewportState(map, isMapLoaded, initialZoom);
  const { markerObjects, modelObjects } = useVisibleObjects(
    objects,
    dragOverride,
    zoom,
    bounds,
    transformOverride,
  );

  const infoObject =
    findObjectById(objects, hoverTarget.targetId) ?? findObjectById(objects, highlightedObjectId);
  const infoAnchor = useMemo(
    (): GeoMapLngLat | null =>
      infoObject ? { longitude: infoObject.longitude, latitude: infoObject.latitude } : null,
    [infoObject?.longitude, infoObject?.latitude],
  );

  const onObjectHoverRef = useRef(onObjectHover);
  onObjectHoverRef.current = onObjectHover;
  useEffect(() => {
    onObjectHoverRef.current?.(hoverTarget.targetId);
  }, [hoverTarget.targetId]);

  const handleObjectHover = (id: string | null): void => {
    hoverTarget.setTargetId(id);
  };

  const infoPoint = useMapAnchoredScreenPoint(map, isMapLoaded, infoAnchor);

  useMapFocus({ map, isMapLoaded, objects, focusRequest });
  useMapViewRequest({ map, isMapLoaded, viewRequest });
  useModelFootprintMasks({ map, isMapLoaded, modelObjects, adminOsmHideSession });
  useOsmBuildingPick({
    map,
    isMapLoaded,
    enabled: editable && Boolean(onOsmBuildingSelect),
    selectedBuilding: selectedOsmBuilding,
    onSelect: onOsmBuildingSelect ?? (() => undefined),
  });
  useGeoMapEmptyClick({
    map,
    isMapLoaded,
    enabled: editable && Boolean(onMapClick),
    onMapClick,
  });
  useMarkerLayer({
    map,
    isMapLoaded,
    markerObjects,
    zoom,
    editable,
    highlightedObjectId,
    onObjectClick,
    onObjectHover: handleObjectHover,
    onObjectDragMove: (id, position) => setDragOverride({ id, ...position }),
    onObjectDragged: (id, position) => {
      setDragOverride(null);
      onObjectDragged?.(id, position);
    },
  });
  useThreeBuildingLayer({ map, isMapLoaded, modelObjects });
  useEffect(() => {
    if (!map || !isMapLoaded) {
      setUiOverlayRoot(null);
      return;
    }

    const container = map.getContainer();
    const overlay = document.createElement('div');
    overlay.setAttribute('data-geo-map-ui-overlay', 'true');
    overlay.className = `pointer-events-none absolute inset-0 ${GEO_MAP_UI_OVERLAY_Z_INDEX_CLASS}`;
    container.appendChild(overlay);
    setUiOverlayRoot(overlay);

    return () => {
      overlay.remove();
      setUiOverlayRoot(null);
    };
  }, [map, isMapLoaded]);

  if (!isWebglSupported) {
    return <GeoMapWebglFallback className={className} />;
  }

  return (
    <div className={`relative h-full w-full ${className ?? ''}`}>
      <div ref={containerRef} className="relative z-0 h-full w-full" />
      {map ? <GeoMapCameraControls map={map} className={cameraControlsClassName} /> : null}
      {!editable && infoObject ? (
        <GeoMapInfoCard
          projectName={infoObject.label}
          addressLine={infoObject.addressLine}
          logoUrl={infoObject.logoUrl}
          anchor={infoPoint ? resolveInfoCardPlacement(infoPoint) : null}
          {...(onObjectClick
            ? {
                onActivate: () => onObjectClick(infoObject.id),
                onPointerEnter: hoverTarget.holdTarget,
                onPointerLeave: hoverTarget.releaseTarget,
              }
            : {})}
        />
      ) : null}
      {uiOverlayRoot && editable && adminSelectionChrome
        ? createPortal(<GeoMapAdminMapSelectionChrome {...adminSelectionChrome} />, uiOverlayRoot)
        : null}
    </div>
  );
};
