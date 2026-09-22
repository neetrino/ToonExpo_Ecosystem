import { Matrix4, Quaternion, Vector3 } from 'three';

import { degToRad } from '@/features/geo-map/three/constants';
import { treeLocalOffsetM } from '@/features/geo-map/trees/tree-local-offset';
import type { CanopyTreeInstance, GreenLngLat } from '@/features/geo-map/trees/types';

const position = new Vector3();
const quaternion = new Quaternion();
const scale = new Vector3();
const matrix = new Matrix4();
const axisY = new Vector3(0, 1, 0);

/** Write instance matrices in the origin's Y-up meter frame. */
export const writeCanopyInstanceMatrices = (
  instances: readonly CanopyTreeInstance[],
  origin: GreenLngLat,
  meterScale: number,
  write: (index: number, matrix: Matrix4) => void,
): void => {
  for (let index = 0; index < instances.length; index += 1) {
    const instance = instances[index];
    if (!instance) {
      continue;
    }
    const local = treeLocalOffsetM(origin, instance, meterScale);
    position.set(local.x, local.y, local.z);
    quaternion.setFromAxisAngle(axisY, degToRad(instance.headingDeg));
    scale.set(instance.scale, instance.scale, instance.scale);
    write(index, matrix.compose(position, quaternion, scale));
  }
};
