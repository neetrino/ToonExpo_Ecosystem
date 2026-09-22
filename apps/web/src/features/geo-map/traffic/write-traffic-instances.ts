import { Matrix4, Quaternion, Vector3 } from 'three';

import type { TrafficCarPose } from '@/features/geo-map/traffic/types';
import { degToRad } from '@/features/geo-map/three/constants';
import { treeLocalOffsetM } from '@/features/geo-map/trees/tree-local-offset';
import type { GreenLngLat } from '@/features/geo-map/trees/types';

const position = new Vector3();
const quaternion = new Quaternion();
const scale = new Vector3(1, 1, 1);
const matrix = new Matrix4();
const axisY = new Vector3(0, 1, 0);

/** Write car instance matrices in the origin's Y-up meter frame. */
export const writeTrafficInstanceMatrices = (
  poses: readonly TrafficCarPose[],
  origin: GreenLngLat,
  meterScale: number,
  write: (index: number, matrix: Matrix4) => void,
): void => {
  for (let index = 0; index < poses.length; index += 1) {
    const pose = poses[index];
    if (!pose) {
      continue;
    }
    const local = treeLocalOffsetM(origin, pose, meterScale);
    position.set(local.x, local.y, local.z);
    quaternion.setFromAxisAngle(axisY, degToRad(pose.headingDeg));
    write(index, matrix.compose(position, quaternion, scale));
  }
};
