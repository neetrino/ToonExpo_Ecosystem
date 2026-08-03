/**
 * Geo-map Three.js custom-layer surface.
 *
 * Architecture: MapLibre owns basemap / OSM / camera; all custom 3D content
 * lives in MapLibre `CustomLayerInterface` implementations under this folder —
 * same matrix model as Manvel-Lambaryan/Map
 * (`mainMatrix * translate * scale(y:-s) * Rx*Ry*Rz`).
 *
 * Layers:
 * - `ThreeBuildingLayer` — project GLB buildings (`use-three-building-layer.ts`)
 *
 * Extension point: optional future layers (e.g. park vegetation, sparse
 * traffic) would add a new `*Layer` class + `ensure*` / `remove*` helpers and
 * mount from a dedicated hook — not shipped in production today.
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
