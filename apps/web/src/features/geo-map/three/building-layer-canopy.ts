import { type CustomRenderMethodInput, MercatorCoordinate } from 'maplibre-gl';
import { InstancedMesh, type Camera, type Scene, type WebGLRenderer } from 'three';

import { DEFAULT_MODEL_ROTATION_X_DEG } from '@/features/geo-map/three/constants';
import { disposeThreeObject } from '@/features/geo-map/three/dispose-three-object';
import {
  composeCameraProjectionMatrix,
  composeModelTransformMatrix,
} from '@/features/geo-map/three/model-transform-matrix';
import { GREEN_CANOPY_MAX_VISIBLE } from '@/features/geo-map/trees/constants';
import {
  createCanopyTreeGeometry,
  createCanopyTreeMaterial,
} from '@/features/geo-map/trees/create-canopy-tree';
import type { CanopyTreeInstance, GreenLngLat } from '@/features/geo-map/trees/types';
import { writeCanopyInstanceMatrices } from '@/features/geo-map/trees/write-canopy-instances';

export const createBuildingCanopyMesh = (): InstancedMesh => {
  const mesh = new InstancedMesh(
    createCanopyTreeGeometry(),
    createCanopyTreeMaterial(),
    GREEN_CANOPY_MAX_VISIBLE,
  );
  mesh.count = 0;
  mesh.frustumCulled = false;
  mesh.visible = false;
  return mesh;
};

export const disposeBuildingCanopyMesh = (scene: Scene, mesh: InstancedMesh | null): void => {
  if (!mesh) {
    return;
  }
  scene.remove(mesh);
  disposeThreeObject(mesh);
};

export const writeBuildingCanopyInstances = (
  mesh: InstancedMesh,
  instances: readonly CanopyTreeInstance[],
  origin: GreenLngLat,
): void => {
  const mercator = MercatorCoordinate.fromLngLat([origin.longitude, origin.latitude], 0);
  const meterScale = mercator.meterInMercatorCoordinateUnits();
  writeCanopyInstanceMatrices(instances, origin, meterScale, (index, matrix) => {
    mesh.setMatrixAt(index, matrix);
  });
  mesh.count = instances.length;
  mesh.instanceMatrix.needsUpdate = true;
};

export const renderBuildingCanopy = (
  renderer: WebGLRenderer,
  scene: Scene,
  camera: Camera,
  mesh: InstancedMesh,
  origin: GreenLngLat,
  options: CustomRenderMethodInput,
): void => {
  if (mesh.count === 0) {
    return;
  }
  const mercator = MercatorCoordinate.fromLngLat([origin.longitude, origin.latitude], 0);
  const modelTransform = composeModelTransformMatrix({
    mercatorX: mercator.x,
    mercatorY: mercator.y,
    mercatorZ: mercator.z ?? 0,
    meterScale: mercator.meterInMercatorCoordinateUnits(),
    rotationXDeg: DEFAULT_MODEL_ROTATION_X_DEG,
    rotationYDeg: 0,
    rotationZDeg: 0,
  });
  mesh.visible = true;
  camera.projectionMatrix.copy(
    composeCameraProjectionMatrix(options.defaultProjectionData.mainMatrix, modelTransform),
  );
  renderer.resetState();
  renderer.render(scene, camera);
  mesh.visible = false;
};
