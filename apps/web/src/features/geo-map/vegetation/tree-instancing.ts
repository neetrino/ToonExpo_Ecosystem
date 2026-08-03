import {
  DynamicDrawUsage,
  Euler,
  InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
  type Scene,
} from 'three';

import { lngLatToLocalMeters } from '@/features/geo-map/vegetation/polygon-geometry';
import type { TreeSpeciesTemplate } from '@/features/geo-map/vegetation/tree-model-loader';
import type { TreeInstanceSpec, TreeSpeciesId } from '@/features/geo-map/vegetation/types';

export type VegetationInstancing = {
  meshes: InstancedMesh[];
  updatePoses: (originLng: number, originLat: number, groundOffset: number) => void;
  dispose: () => void;
};

type PartBucket = {
  mesh: InstancedMesh;
  localMatrix: Matrix4;
  instances: TreeInstanceSpec[];
};

export const createVegetationInstancing = (
  scene: Scene,
  templates: Map<TreeSpeciesId, TreeSpeciesTemplate>,
  instances: TreeInstanceSpec[],
): VegetationInstancing => {
  const bySpecies = new Map<TreeSpeciesId, TreeInstanceSpec[]>();
  for (const inst of instances) {
    const list = bySpecies.get(inst.species) ?? [];
    list.push(inst);
    bySpecies.set(inst.species, list);
  }

  const buckets: PartBucket[] = [];
  for (const [speciesId, list] of bySpecies) {
    const template = templates.get(speciesId);
    if (!template || list.length === 0) {
      continue;
    }
    for (const part of template.parts) {
      const mesh = new InstancedMesh(part.geometry, part.material, list.length);
      mesh.instanceMatrix.setUsage(DynamicDrawUsage);
      mesh.frustumCulled = false;
      mesh.matrixAutoUpdate = false;
      scene.add(mesh);
      buckets.push({ mesh, localMatrix: part.localMatrix.clone(), instances: list });
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
        tmpScale.set(inst.scale, inst.scale, inst.scale);
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
