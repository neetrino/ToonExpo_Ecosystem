import {
  DynamicDrawUsage,
  Euler,
  InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
  type Scene,
} from 'three';

import type { GrassTemplate } from '@/features/geo-map/vegetation/grass-model-loader';
import { lngLatToLocalMeters } from '@/features/geo-map/vegetation/polygon-geometry';
import type { GrassInstanceSpec } from '@/features/geo-map/vegetation/types';

export type GrassInstancing = {
  meshes: InstancedMesh[];
  updatePoses: (originLng: number, originLat: number, groundOffset: number) => void;
  dispose: () => void;
};

type PartBucket = {
  mesh: InstancedMesh;
  localMatrix: Matrix4;
  instances: GrassInstanceSpec[];
};

export const createGrassInstancing = (
  scene: Scene,
  template: GrassTemplate,
  instances: GrassInstanceSpec[],
): GrassInstancing => {
  const buckets: PartBucket[] = [];
  if (instances.length > 0) {
    for (const part of template.parts) {
      const mesh = new InstancedMesh(part.geometry, part.material, instances.length);
      mesh.instanceMatrix.setUsage(DynamicDrawUsage);
      mesh.frustumCulled = false;
      mesh.matrixAutoUpdate = false;
      scene.add(mesh);
      buckets.push({ mesh, localMatrix: part.localMatrix.clone(), instances });
    }
  }

  const tmpPos = new Vector3();
  const tmpQuat = new Quaternion();
  const tmpScale = new Vector3();
  const tmpEuler = new Euler();
  const tmpMatrix = new Matrix4();
  const tmpWorld = new Matrix4();

  const updatePoses = (originLng: number, originLat: number, groundOffset: number): void => {
    for (const bucket of buckets) {
      for (let i = 0; i < bucket.instances.length; i++) {
        const inst = bucket.instances[i]!;
        const { x: east, y: north } = lngLatToLocalMeters(originLng, originLat, inst.lng, inst.lat);
        tmpPos.set(east, groundOffset, -north);
        tmpEuler.set(0, -inst.rotationY, 0);
        tmpQuat.setFromEuler(tmpEuler);
        tmpScale.set(inst.scaleX, inst.scaleY, 1);
        tmpWorld.compose(tmpPos, tmpQuat, tmpScale);
        tmpMatrix.copy(tmpWorld).multiply(bucket.localMatrix);
        bucket.mesh.setMatrixAt(i, tmpMatrix);
      }
      bucket.mesh.instanceMatrix.needsUpdate = true;
    }
  };

  return {
    meshes: buckets.map((bucket) => bucket.mesh),
    updatePoses,
    dispose: () => {
      for (const bucket of buckets) {
        scene.remove(bucket.mesh);
        bucket.mesh.dispose();
      }
      buckets.length = 0;
    },
  };
};
