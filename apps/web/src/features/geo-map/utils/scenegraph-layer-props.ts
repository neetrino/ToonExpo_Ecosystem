import { SCENEGRAPH_DEFAULT_COLOR, SCENEGRAPH_LAYER_ID_PREFIX } from '@/features/geo-map/constants';
import type { GeoMapObject } from '@/features/geo-map/types';

/** Per-instance datum consumed by a single `ScenegraphLayer` group's accessors. */
export type ScenegraphLayerObjectDatum = {
  id: string;
  longitude: number;
  latitude: number;
  altitudeM: number;
  headingDeg: number;
  pitchDeg: number;
  rollDeg: number;
  scale: number;
};

/**
 * One `ScenegraphLayer`'s worth of props: `ScenegraphLayer.scenegraph` is a single
 * GLB url for the whole layer, so distinct projects with distinct GLBs each need
 * their own layer — grouped here by `modelUrl` so identical GLBs share one layer.
 */
export type ScenegraphLayerGroup = {
  layerId: string;
  modelUrl: string;
  data: ScenegraphLayerObjectDatum[];
};

const toDatum = (object: GeoMapObject): ScenegraphLayerObjectDatum => ({
  id: object.id,
  longitude: object.longitude,
  latitude: object.latitude,
  altitudeM: object.altitudeM,
  headingDeg: object.headingDeg,
  pitchDeg: object.pitchDeg,
  rollDeg: object.rollDeg,
  scale: object.scale,
});

/** Groups visible model objects by GLB url so each unique model renders as one `ScenegraphLayer`. */
export const groupObjectsByModelUrl = (objects: GeoMapObject[]): ScenegraphLayerGroup[] => {
  const groupsByUrl = new Map<string, ScenegraphLayerObjectDatum[]>();

  for (const object of objects) {
    const existing = groupsByUrl.get(object.modelUrl);
    if (existing) {
      existing.push(toDatum(object));
    } else {
      groupsByUrl.set(object.modelUrl, [toDatum(object)]);
    }
  }

  return Array.from(groupsByUrl.entries()).map(([modelUrl, data], index) => ({
    layerId: `${SCENEGRAPH_LAYER_ID_PREFIX}-${index}`,
    modelUrl,
    data,
  }));
};

/** deck.gl `getPosition` accessor — `[longitude, latitude, altitudeM]`. */
export const getScenegraphObjectPosition = (
  datum: ScenegraphLayerObjectDatum,
): [number, number, number] => [datum.longitude, datum.latitude, datum.altitudeM];

/** deck.gl `getOrientation` accessor — `[pitch, yaw, roll]` in degrees. */
export const getScenegraphObjectOrientation = (
  datum: ScenegraphLayerObjectDatum,
): [number, number, number] => [datum.pitchDeg, datum.headingDeg, datum.rollDeg];

/** deck.gl `getScale` accessor — uniform scale on every axis. */
export const getScenegraphObjectScale = (
  datum: ScenegraphLayerObjectDatum,
): [number, number, number] => [datum.scale, datum.scale, datum.scale];

/**
 * deck.gl `getColor` accessor — always opaque white so textured GLB materials
 * stay intact. Selection uses pins / chrome / info card; hover uses Layer
 * `autoHighlight`.
 */
export const getScenegraphObjectColor = (
  _datum: ScenegraphLayerObjectDatum,
): [number, number, number, number] => SCENEGRAPH_DEFAULT_COLOR;
