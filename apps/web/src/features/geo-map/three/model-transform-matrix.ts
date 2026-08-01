import { Matrix4, Vector3 } from 'three';

import { degToRad } from '@/features/geo-map/three/constants';

/**
 * Pose inputs for the MapLibre + Three.js model transform.
 * Field mapping (POC panel ↔ GeoMapObject):
 * - `rotationXDeg` ← `pitchDeg` (default 90)
 * - `rotationYDeg` ← `headingDeg`
 * - `rotationZDeg` ← `rollDeg`
 */
export type ModelTransformPose = {
  mercatorX: number;
  mercatorY: number;
  mercatorZ: number;
  /** `meterInMercatorCoordinateUnits() * userScale` */
  meterScale: number;
  rotationXDeg: number;
  rotationYDeg: number;
  rotationZDeg: number;
};

/**
 * POC / MapLibre three.js example composition:
 * translate(mercator).scale(s, -s, s).multiply(rotX).multiply(rotY).multiply(rotZ)
 *
 * The negated Y scale is critical — without it models tip off the ground plane.
 */
export const composeModelTransformMatrix = (pose: ModelTransformPose): Matrix4 => {
  const { meterScale } = pose;
  const rotationX = new Matrix4().makeRotationAxis(
    new Vector3(1, 0, 0),
    degToRad(pose.rotationXDeg),
  );
  const rotationY = new Matrix4().makeRotationAxis(
    new Vector3(0, 1, 0),
    degToRad(pose.rotationYDeg),
  );
  const rotationZ = new Matrix4().makeRotationAxis(
    new Vector3(0, 0, 1),
    degToRad(pose.rotationZDeg),
  );

  return new Matrix4()
    .makeTranslation(pose.mercatorX, pose.mercatorY, pose.mercatorZ)
    .scale(new Vector3(meterScale, -meterScale, meterScale))
    .multiply(rotationX)
    .multiply(rotationY)
    .multiply(rotationZ);
};

/**
 * `camera.projectionMatrix = mainMatrix * modelTransform` (MapLibre custom layer).
 */
export const composeCameraProjectionMatrix = (
  mainMatrixElements: ArrayLike<number>,
  modelTransform: Matrix4,
): Matrix4 => {
  const main = new Matrix4().fromArray(Array.from(mainMatrixElements));
  return main.multiply(modelTransform);
};
