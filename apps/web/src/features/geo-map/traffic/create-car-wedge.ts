import { BufferAttribute, BufferGeometry } from 'three';

import { paintCarGeometry } from '@/features/geo-map/traffic/paint-car-geometry';

const WEDGE_VERTEX_COUNT = 8;

/**
 * Low-poly trapezoid prism (8 verts). Used for hood / greenhouse slope
 * without raising the InstancedMesh cost.
 */
export const createCarWedge = (
  bottom: { width: number; depth: number },
  top: { width: number; depth: number; shiftZ: number },
  height: number,
  x: number,
  y: number,
  z: number,
  hex: number,
): BufferGeometry => {
  const hwB = bottom.width / 2;
  const hdB = bottom.depth / 2;
  const hwT = top.width / 2;
  const hdT = top.depth / 2;
  const positions = new Float32Array([
    -hwB,
    0,
    -hdB,
    hwB,
    0,
    -hdB,
    hwB,
    0,
    hdB,
    -hwB,
    0,
    hdB,
    -hwT,
    height,
    -hdT + top.shiftZ,
    hwT,
    height,
    -hdT + top.shiftZ,
    hwT,
    height,
    hdT + top.shiftZ,
    -hwT,
    height,
    hdT + top.shiftZ,
  ]);
  for (let index = 0; index < WEDGE_VERTEX_COUNT; index += 1) {
    const offset = index * 3;
    positions[offset] = (positions[offset] ?? 0) + x;
    positions[offset + 1] = (positions[offset + 1] ?? 0) + y;
    positions[offset + 2] = (positions[offset + 2] ?? 0) + z;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(WEDGE_VERTEX_COUNT * 3), 3));
  geometry.setIndex([
    0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 3, 7, 6, 3, 6, 2, 0, 4, 7, 0, 7, 3, 1, 2,
    6, 1, 6, 5,
  ]);
  return paintCarGeometry(geometry, hex);
};
