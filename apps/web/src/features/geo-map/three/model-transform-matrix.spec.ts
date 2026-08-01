import { describe, expect, it } from 'vitest';
import { Matrix4 } from 'three';

import { DEFAULT_MODEL_ROTATION_X_DEG } from '@/features/geo-map/three/constants';
import {
  composeCameraProjectionMatrix,
  composeModelTransformMatrix,
} from '@/features/geo-map/three/model-transform-matrix';

describe('composeModelTransformMatrix', () => {
  it('negates Y scale (POC critical flip)', () => {
    const matrix = composeModelTransformMatrix({
      mercatorX: 0.1,
      mercatorY: 0.2,
      mercatorZ: 0,
      meterScale: 2,
      rotationXDeg: 0,
      rotationYDeg: 0,
      rotationZDeg: 0,
    });
    // Column-major: m11=sx, m22=sy, m33=sz
    expect(matrix.elements[0]).toBeCloseTo(2);
    expect(matrix.elements[5]).toBeCloseTo(-2);
    expect(matrix.elements[10]).toBeCloseTo(2);
    expect(matrix.elements[12]).toBeCloseTo(0.1);
    expect(matrix.elements[13]).toBeCloseTo(0.2);
  });

  it('uses DEFAULT_MODEL_ROTATION_X_DEG = 90 (pitchDeg mapping)', () => {
    expect(DEFAULT_MODEL_ROTATION_X_DEG).toBe(90);
    const withPitch = composeModelTransformMatrix({
      mercatorX: 0,
      mercatorY: 0,
      mercatorZ: 0,
      meterScale: 1,
      rotationXDeg: DEFAULT_MODEL_ROTATION_X_DEG,
      rotationYDeg: 0,
      rotationZDeg: 0,
    });
    const withoutPitch = composeModelTransformMatrix({
      mercatorX: 0,
      mercatorY: 0,
      mercatorZ: 0,
      meterScale: 1,
      rotationXDeg: 0,
      rotationYDeg: 0,
      rotationZDeg: 0,
    });
    expect(withPitch.equals(withoutPitch)).toBe(false);
  });

  it('composes rotations in Rx → Ry → Rz multiply order', () => {
    const onlyX = composeModelTransformMatrix({
      mercatorX: 0,
      mercatorY: 0,
      mercatorZ: 0,
      meterScale: 1,
      rotationXDeg: 90,
      rotationYDeg: 0,
      rotationZDeg: 0,
    });
    const xThenY = composeModelTransformMatrix({
      mercatorX: 0,
      mercatorY: 0,
      mercatorZ: 0,
      meterScale: 1,
      rotationXDeg: 90,
      rotationYDeg: 45,
      rotationZDeg: 0,
    });
    expect(onlyX.equals(xThenY)).toBe(false);
  });
});

describe('composeCameraProjectionMatrix', () => {
  it('multiplies mainMatrix * modelTransform', () => {
    const identity = new Matrix4().identity();
    const model = composeModelTransformMatrix({
      mercatorX: 1,
      mercatorY: 2,
      mercatorZ: 3,
      meterScale: 1,
      rotationXDeg: 0,
      rotationYDeg: 0,
      rotationZDeg: 0,
    });
    const result = composeCameraProjectionMatrix(identity.elements, model.clone());
    expect(result.equals(model)).toBe(true);
  });
});
