import { BoxGeometry, CylinderGeometry, type BufferGeometry } from 'three';

import { createCarWedge } from '@/features/geo-map/traffic/create-car-wedge';
import {
  ROAD_TRAFFIC_CABIN_COLOR,
  ROAD_TRAFFIC_COLOR,
  ROAD_TRAFFIC_GLASS_COLOR,
  ROAD_TRAFFIC_GRILLE_COLOR,
  ROAD_TRAFFIC_LIGHT_COLOR,
  ROAD_TRAFFIC_RIM_COLOR,
  ROAD_TRAFFIC_TAIL_COLOR,
  ROAD_TRAFFIC_TIRE_COLOR,
} from '@/features/geo-map/traffic/constants';
import { paintCarGeometry } from '@/features/geo-map/traffic/paint-car-geometry';

const WHEEL_RADIUS_M = 0.32;
const WHEEL_WIDTH_M = 0.2;
const WHEEL_SEGMENTS = 8;
const WHEEL_Y_M = 0.32;
const WHEEL_X_M = 0.73;
const WHEEL_FRONT_Z_M = 1.26;
const WHEEL_REAR_Z_M = -1.3;
const HALF_PI = Math.PI / 2;

const paintedBox = (
  width: number,
  height: number,
  depth: number,
  x: number,
  y: number,
  z: number,
  hex: number,
  rotateX = 0,
): BufferGeometry => {
  const box = new BoxGeometry(width, height, depth);
  if (rotateX !== 0) {
    box.rotateX(rotateX);
  }
  box.translate(x, y, z);
  return paintCarGeometry(box, hex);
};

const paintedWheel = (x: number, z: number): BufferGeometry[] => {
  const tire = new CylinderGeometry(WHEEL_RADIUS_M, WHEEL_RADIUS_M, WHEEL_WIDTH_M, WHEEL_SEGMENTS);
  tire.rotateZ(HALF_PI);
  tire.translate(x, WHEEL_Y_M, z);
  const rim = new CylinderGeometry(
    WHEEL_RADIUS_M * 0.55,
    WHEEL_RADIUS_M * 0.55,
    WHEEL_WIDTH_M + 0.02,
    WHEEL_SEGMENTS,
  );
  rim.rotateZ(HALF_PI);
  rim.translate(x, WHEEL_Y_M, z);
  return [
    paintCarGeometry(tire, ROAD_TRAFFIC_TIRE_COLOR),
    paintCarGeometry(rim, ROAD_TRAFFIC_RIM_COLOR),
  ];
};

/** White sedan body — low, long, slightly tapered greenhouse. */
export const createTrafficCarBodyParts = (): BufferGeometry[] => [
  paintedBox(1.74, 0.12, 3.88, 0, 0.36, 0.02, ROAD_TRAFFIC_COLOR),
  paintedBox(1.76, 0.36, 4.08, 0, 0.58, 0, ROAD_TRAFFIC_COLOR),
  createCarWedge(
    { width: 1.7, depth: 1.38 },
    { width: 1.58, depth: 0.92, shiftZ: -0.16 },
    0.16,
    0,
    0.76,
    1.18,
    ROAD_TRAFFIC_COLOR,
  ),
  createCarWedge(
    { width: 1.66, depth: 2.02 },
    { width: 1.38, depth: 1.22, shiftZ: -0.2 },
    0.5,
    0,
    0.82,
    -0.12,
    ROAD_TRAFFIC_CABIN_COLOR,
  ),
  paintedBox(1.42, 0.06, 1.18, 0, 1.34, -0.28, ROAD_TRAFFIC_CABIN_COLOR),
  paintedBox(1.68, 0.18, 0.92, 0, 0.74, -1.62, ROAD_TRAFFIC_COLOR),
  paintedBox(1.8, 0.2, 0.16, 0, 0.48, 2.1, ROAD_TRAFFIC_COLOR),
  paintedBox(1.8, 0.2, 0.14, 0, 0.48, -2.08, ROAD_TRAFFIC_COLOR),
  paintedBox(0.15, 0.09, 0.2, -0.9, 1.02, 0.38, ROAD_TRAFFIC_CABIN_COLOR),
  paintedBox(0.15, 0.09, 0.2, 0.9, 1.02, 0.38, ROAD_TRAFFIC_CABIN_COLOR),
];

/** Glass, grille, and lamps — still one merged mesh. */
export const createTrafficCarGlassParts = (): BufferGeometry[] => [
  paintedBox(1.46, 0.48, 0.04, 0, 1.06, 0.78, ROAD_TRAFFIC_GLASS_COLOR, -0.52),
  paintedBox(1.4, 0.4, 0.04, 0, 1.08, -1.12, ROAD_TRAFFIC_GLASS_COLOR, 0.46),
  paintedBox(0.035, 0.32, 1.02, -0.78, 1.08, -0.18, ROAD_TRAFFIC_GLASS_COLOR),
  paintedBox(0.035, 0.32, 1.02, 0.78, 1.08, -0.18, ROAD_TRAFFIC_GLASS_COLOR),
  paintedBox(0.72, 0.16, 0.04, 0, 0.54, 2.16, ROAD_TRAFFIC_GRILLE_COLOR),
  paintedBox(0.38, 0.1, 0.07, -0.56, 0.56, 2.15, ROAD_TRAFFIC_LIGHT_COLOR),
  paintedBox(0.38, 0.1, 0.07, 0.56, 0.56, 2.15, ROAD_TRAFFIC_LIGHT_COLOR),
  paintedBox(0.36, 0.09, 0.05, -0.54, 0.58, -2.12, ROAD_TRAFFIC_TAIL_COLOR),
  paintedBox(0.36, 0.09, 0.05, 0.54, 0.58, -2.12, ROAD_TRAFFIC_TAIL_COLOR),
];

export const createTrafficCarWheelParts = (): BufferGeometry[] => [
  ...paintedWheel(-WHEEL_X_M, WHEEL_FRONT_Z_M),
  ...paintedWheel(WHEEL_X_M, WHEEL_FRONT_Z_M),
  ...paintedWheel(-WHEEL_X_M, WHEEL_REAR_Z_M),
  ...paintedWheel(WHEEL_X_M, WHEEL_REAR_Z_M),
];
