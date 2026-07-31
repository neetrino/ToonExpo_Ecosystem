'use client';

import type { PickingInfo } from '@deck.gl/core';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { GLTFLoader } from '@loaders.gl/gltf';
import type { MapLibreMap } from 'maplibre-gl';
import { useEffect, useRef } from 'react';

import { SCENEGRAPH_SIZE_MIN_PIXELS, SCENEGRAPH_SIZE_SCALE } from '@/features/geo-map/constants';
import type { GeoMapLngLat, GeoMapObject } from '@/features/geo-map/types';
import {
  getScenegraphObjectOrientation,
  getScenegraphObjectPosition,
  getScenegraphObjectScale,
  groupObjectsByModelUrl,
  type ScenegraphLayerObjectDatum,
} from '@/features/geo-map/utils/scenegraph-layer-props';

export type UseDeckOverlayOptions = {
  map: MapLibreMap | null;
  isMapLoaded: boolean;
  modelObjects: GeoMapObject[];
  editable: boolean;
  onObjectClick?: ((id: string) => void) | undefined;
  onObjectHover?: ((id: string | null) => void) | undefined;
  onMapClick?: ((position: GeoMapLngLat) => void) | undefined;
  /** Fired continuously while an `editable` model drag is in progress. */
  onModelDragMove: (id: string, position: GeoMapLngLat) => void;
  /** Fired once an `editable` model drag ends. */
  onModelDragEnd: (id: string, position: GeoMapLngLat) => void;
};

type ScenegraphPickingInfo = PickingInfo<ScenegraphLayerObjectDatum>;

const toLngLat = (coordinate: number[] | undefined): GeoMapLngLat | null =>
  coordinate && coordinate.length >= 2
    ? { longitude: coordinate[0]!, latitude: coordinate[1]! }
    : null;

const buildScenegraphLayers = (
  modelObjects: GeoMapObject[],
): ScenegraphLayer<ScenegraphLayerObjectDatum>[] =>
  groupObjectsByModelUrl(modelObjects).map(
    (group) =>
      new ScenegraphLayer<ScenegraphLayerObjectDatum>({
        id: group.layerId,
        data: group.data,
        scenegraph: group.modelUrl,
        loaders: [GLTFLoader],
        _lighting: 'pbr',
        pickable: true,
        sizeScale: SCENEGRAPH_SIZE_SCALE,
        sizeMinPixels: SCENEGRAPH_SIZE_MIN_PIXELS,
        getPosition: getScenegraphObjectPosition,
        getOrientation: getScenegraphObjectOrientation,
        getScale: getScenegraphObjectScale,
      }),
  );

/** Builds the `MapboxOverlay` interaction callbacks (click / hover / drag) for one render. */
const buildOverlayInteractionProps = (
  map: MapLibreMap,
  draggingIdRef: { current: string | null },
  options: Pick<
    UseDeckOverlayOptions,
    | 'editable'
    | 'onObjectClick'
    | 'onObjectHover'
    | 'onMapClick'
    | 'onModelDragMove'
    | 'onModelDragEnd'
  >,
) => ({
  onClick: (info: ScenegraphPickingInfo) => {
    if (info.picked && info.object) {
      options.onObjectClick?.(info.object.id);
      return;
    }
    const position = toLngLat(info.coordinate);
    if (position) {
      options.onMapClick?.(position);
    }
  },
  onHover: (info: ScenegraphPickingInfo) => {
    options.onObjectHover?.(info.picked && info.object ? info.object.id : null);
  },
  onDragStart: (info: ScenegraphPickingInfo) => {
    if (!options.editable || !info.picked || !info.object) {
      return;
    }
    draggingIdRef.current = info.object.id;
    map.dragPan.disable();
  },
  onDrag: (info: ScenegraphPickingInfo) => {
    const id = draggingIdRef.current;
    const position = toLngLat(info.coordinate);
    if (id && position) {
      options.onModelDragMove(id, position);
    }
  },
  onDragEnd: (info: ScenegraphPickingInfo) => {
    const id = draggingIdRef.current;
    const position = toLngLat(info.coordinate);
    draggingIdRef.current = null;
    map.dragPan.enable();
    if (id && position) {
      options.onModelDragEnd(id, position);
    }
  },
});

/**
 * Creates a `MapboxOverlay` interleaved with MapLibre and keeps it in sync with
 * `modelObjects`: one `ScenegraphLayer` per unique GLB url. Click/hover/drag are
 * wired at the overlay level (fires for both hits and empty-space interactions).
 */
export const useDeckOverlay = ({
  map,
  isMapLoaded,
  modelObjects,
  editable,
  onObjectClick,
  onObjectHover,
  onMapClick,
  onModelDragMove,
  onModelDragEnd,
}: UseDeckOverlayOptions): void => {
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const draggingIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map || !isMapLoaded) {
      return;
    }

    const overlay = new MapboxOverlay({ interleaved: true, layers: [] });
    map.addControl(overlay);
    overlayRef.current = overlay;

    return () => {
      map.removeControl(overlay);
      overlayRef.current = null;
    };
  }, [map, isMapLoaded]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !map) {
      return;
    }

    overlay.setProps({
      layers: buildScenegraphLayers(modelObjects),
      ...buildOverlayInteractionProps(map, draggingIdRef, {
        editable,
        onObjectClick,
        onObjectHover,
        onMapClick,
        onModelDragMove,
        onModelDragEnd,
      }),
    });
  }, [
    map,
    modelObjects,
    editable,
    onObjectClick,
    onObjectHover,
    onMapClick,
    onModelDragMove,
    onModelDragEnd,
  ]);
};
