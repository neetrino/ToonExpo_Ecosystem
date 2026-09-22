import { ExtrudeGeometry, Shape, type BufferGeometry } from 'three';

import { paintCarGeometry } from '@/features/geo-map/traffic/paint-car-geometry';

const EXTRUDE_BEVEL_SIZE_M = 0.045;
const EXTRUDE_BEVEL_THICKNESS_M = 0.035;

const shapeFromProfile = (profile: readonly (readonly [number, number])[]): Shape => {
  const shape = new Shape();
  const first = profile[0];
  if (!first) {
    return shape;
  }
  shape.moveTo(first[0], first[1]);
  for (let index = 1; index < profile.length; index += 1) {
    const point = profile[index];
    if (point) {
      shape.lineTo(point[0], point[1]);
    }
  }
  shape.closePath();
  return shape;
};

/** Extrude a sedan side profile so length faces +Z. */
export const extrudeCarProfile = (
  profile: readonly (readonly [number, number])[],
  widthM: number,
  hex: number,
): BufferGeometry => {
  const geometry = new ExtrudeGeometry(shapeFromProfile(profile), {
    depth: widthM,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: EXTRUDE_BEVEL_SIZE_M,
    bevelThickness: EXTRUDE_BEVEL_THICKNESS_M,
    curveSegments: 1,
  });
  geometry.translate(0, 0, -widthM / 2);
  geometry.rotateY(-Math.PI / 2);
  return paintCarGeometry(geometry, hex);
};
