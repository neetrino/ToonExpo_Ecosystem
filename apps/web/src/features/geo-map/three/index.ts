/**
 * Geo-map Three.js custom-layer surface.
 *
 * Architecture: MapLibre owns basemap / OSM / camera; all custom 3D content
 * (GLB buildings now; cars / vegetation / animations later) lives in MapLibre
 * `CustomLayerInterface` implementations under this folder — same matrix model
 * as Manvel-Lambaryan/Map (`mainMatrix * translate * scale(y:-s) * Rx*Ry*Rz`).
 *
 * Extension point: add a new `*Layer` class + `ensure*` / `remove*` helpers,
 * then mount from a dedicated hook (see `use-three-building-layer.ts`).
 */

export {
  DEFAULT_MODEL_ROTATION_X_DEG,
  THREE_BUILDING_LAYER_ID,
  degToRad,
} from '@/features/geo-map/three/constants';
export {
  ThreeBuildingLayer,
  ensureThreeBuildingLayer,
  removeThreeBuildingLayer,
} from '@/features/geo-map/three/custom-building-layer';
export {
  composeCameraProjectionMatrix,
  composeModelTransformMatrix,
  type ModelTransformPose,
} from '@/features/geo-map/three/model-transform-matrix';
