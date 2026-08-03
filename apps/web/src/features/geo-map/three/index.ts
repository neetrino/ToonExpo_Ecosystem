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
 * - `VegetationLayer` — zoom-gated park trees/grass (`use-vegetation-layer.ts`)
 * - `VehicleLayer` — sparse close-range traffic (`use-vehicle-layer.ts`)
 *
 * Extension point: add a new `*Layer` class + `ensure*` / `remove*` helpers,
 * then mount from a dedicated hook (see the hooks above).
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
  VegetationLayer,
  ensureVegetationLayer,
  removeVegetationLayer,
} from '@/features/geo-map/three/vegetation-layer';
export {
  VehicleLayer,
  ensureVehicleLayer,
  removeVehicleLayer,
} from '@/features/geo-map/three/vehicle-layer';
export {
  composeCameraProjectionMatrix,
  composeModelTransformMatrix,
  type ModelTransformPose,
} from '@/features/geo-map/three/model-transform-matrix';
