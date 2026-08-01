import { Box3, type Object3D, Vector3 } from 'three';

import {
  THREE_MODEL_ABSURD_MAX_DIM_M,
  THREE_MODEL_ABSURD_MIN_DIM_M,
  THREE_MODEL_TARGET_HEIGHT_M,
} from '@/features/geo-map/three/constants';

/**
 * Place model origin at ground center; keep authoring units in meters.
 * Only auto-rescales when the asset is absurdly tiny/huge (POC parity).
 */
export const prepareModelForMap = (root: Object3D): void => {
  root.position.set(0, 0, 0);
  root.rotation.set(0, 0, 0);
  root.scale.set(1, 1, 1);
  root.updateMatrixWorld(true);

  const box = new Box3().setFromObject(root);
  if (box.isEmpty()) {
    return;
  }

  const size = new Vector3();
  const center = new Vector3();
  box.getSize(size);
  box.getCenter(center);

  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= box.min.y;
  root.updateMatrixWorld(true);

  const maxDim = Math.max(size.x, size.y, size.z);
  const isAbsurd =
    maxDim > 0 && (maxDim < THREE_MODEL_ABSURD_MIN_DIM_M || maxDim > THREE_MODEL_ABSURD_MAX_DIM_M);
  if (!isAbsurd) {
    return;
  }

  const factor = THREE_MODEL_TARGET_HEIGHT_M / Math.max(size.y, 0.001);
  root.scale.multiplyScalar(factor);
  root.updateMatrixWorld(true);
  const grounded = new Box3().setFromObject(root);
  root.position.y -= grounded.min.y;
};
