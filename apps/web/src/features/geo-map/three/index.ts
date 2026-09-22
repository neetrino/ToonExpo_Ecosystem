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
 * - Park canopy instances share `ThreeBuildingLayer` (`use-green-canopy-layer.ts`)
 * - Road traffic instances share `ThreeBuildingLayer` (`use-road-traffic-layer.ts`)
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
