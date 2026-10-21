import { Mesh, PlaneGeometry, type MeshStandardMaterial, type Scene } from 'three';

import {
  addArrow,
  addBox,
  addPark,
  addPath,
  addRect,
  addTree,
  venueMaterial,
} from '@/features/exhibition/components/public/venue-map-3d/venue-map-primitives';
import { toMetres } from '@/features/exhibition/components/public/venue-map-3d/venue-map-scene-math';
import type { VenueRect } from '@/features/exhibition/components/public/venue-map-3d/venue-map-booths';

const FLOOR_Y = 0;
const FLOOR_H = 0.3;
const MASS_H = 1;
const WING_H = 3.4;
const WC_H = 0.9;
const BENCH_H = 0.45;

const paint = (
  rects: VenueRect[],
  y: number,
  height: number,
  material: MeshStandardMaterial,
  scene: Scene,
  soft = true,
): void => {
  rects.forEach((rect) => addRect(scene, rect, y, height, material, { soft, cast: height > 0.2 }));
};

export const addVenueShell = (scene: Scene): void => {
  const ground = new Mesh(new PlaneGeometry(900, 600), venueMaterial('#e6eaef'));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);

  const park = venueMaterial('#d3e2e6');
  const tree = venueMaterial('#9fc5cf');
  const trunk = venueMaterial('#8fa0b4');
  addPark(scene, park, tree, trunk);

  const floor = venueMaterial('#ffffff');
  const special = venueMaterial('#dcecf0');
  const zone = venueMaterial('#e2eef1');
  const mass = venueMaterial('#c4c8cd');
  const court = venueMaterial('#d4dbe3');
  const wc = venueMaterial('#c4c8cd');
  const dark = venueMaterial('#192643');
  const desk = venueMaterial('#027691');
  const street = venueMaterial('#cfd6df');
  const arrow = venueMaterial('#ffffff');
  const bench = venueMaterial('#c4c8cd');
  const pad = venueMaterial('#cdd5df');

  addRect(scene, [137, 779, 2373, 1416], FLOOR_Y, FLOOR_H, floor, { cast: false });
  addRect(scene, [137, 670, 848, 795], FLOOR_Y, FLOOR_H, floor, { cast: false });
  addRect(scene, [384, 1216, 1360, 1397], FLOOR_H, 0.05, special, { cast: false, soft: true });
  addRect(scene, [902, 670, 1107, 779], FLOOR_Y, 0.12, zone, { cast: false, soft: true });
  addRect(scene, [1955, 1222, 2242, 1345], FLOOR_H, 0.06, zone, { cast: false, soft: true });
  addRect(scene, [131, 1162, 260, 1422], FLOOR_H, 1.8, mass, { soft: true });
  addRect(scene, [1610, 1228, 1820, 1404], FLOOR_H, MASS_H, mass, { soft: true });
  addRect(scene, [2250, 1228, 2365, 1404], FLOOR_H, MASS_H, mass, { soft: true });
  paint(
    [
      [137, 670, 848, 676],
      [842, 670, 848, 779],
      [848, 779, 2373, 785],
      [2367, 779, 2373, 1416],
      [137, 670, 143, 1162],
    ],
    FLOOR_H,
    MASS_H,
    mass,
    scene,
  );
  addWings(scene, mass, court);
  paint(
    [
      [688, 682, 752, 760],
      [752, 682, 816, 760],
      [1184, 1140, 1360, 1216],
      [1595, 1146, 1680, 1216],
    ],
    FLOOR_H,
    WC_H,
    wc,
    scene,
  );
  addRect(scene, [380, 1262, 425, 1352], FLOOR_H, 0.7, dark);
  paint(
    [
      [808, 742, 824, 784],
      [2300, 792, 2342, 805],
      [2345, 805, 2357, 841],
      [2312, 966, 2354, 979],
      [2352, 992, 2364, 1034],
      [2350, 1138, 2362, 1180],
      [2294, 1188, 2336, 1201],
      [1686, 1252, 1699, 1287],
    ],
    FLOOR_H,
    WC_H,
    desk,
    scene,
    false,
  );
  addStreet(scene, street, tree, trunk, arrow);
  addOutdoor(scene, mass, dark, tree, trunk, bench, pad);
};

const addWings = (scene: Scene, mass: MeshStandardMaterial, court: MeshStandardMaterial): void => {
  addRect(scene, [246, 1709, 1600, 1914], 0, WING_H, mass, { soft: true });
  addRect(scene, [1600, 1416, 1824, 1914], 0, WING_H, mass, { soft: true });
  addRect(scene, [2152, 1416, 2373, 1914], 0, WING_H, mass, { soft: true });
  addRect(scene, [1824, 1714, 2152, 1914], 0, WING_H, mass, { soft: true });
  addRect(scene, [1824, 1416, 2152, 1714], 0, 0.06, court, { cast: false, edges: false });
};

const addStreet = (
  scene: Scene,
  street: MeshStandardMaterial,
  crown: MeshStandardMaterial,
  trunk: MeshStandardMaterial,
  arrow: MeshStandardMaterial,
): void => {
  addRect(scene, [131, 1422, 1600, 1709], 0, 0.05, street, { cast: false, edges: false });
  for (let x = 158; x < 1320; x += 64) {
    addTree(scene, toMetres(x), 144.8, 1, trunk, crown);
    addTree(scene, toMetres(x), 167.2, 1, trunk, crown);
  }
  [30, 78, 126].forEach((x) => addArrow(scene, x, arrow));
};

const CANOPY_Y = 3.4;
const CANOPY_ROT = -0.62;

const addOutdoor = (
  scene: Scene,
  mass: MeshStandardMaterial,
  dark: MeshStandardMaterial,
  crown: MeshStandardMaterial,
  trunk: MeshStandardMaterial,
  bench: MeshStandardMaterial,
  pad: MeshStandardMaterial,
): void => {
  const [x1, z1, x2, z2] = [2707, 1039, 3008, 1190].map(toMetres) as [
    number,
    number,
    number,
    number,
  ];
  addBox(scene, x1, z1, x2, z2, CANOPY_Y, 0.35, mass);
  const posts: Array<[number, number]> = [
    [x1 + 0.6, z1 + 0.6],
    [x2 - 0.6, z1 + 0.6],
    [x1 + 0.6, z2 - 0.6],
    [x2 - 0.6, z2 - 0.6],
  ];
  posts.forEach(([x, z]) =>
    addBox(scene, x - 0.2, z - 0.2, x + 0.2, z + 0.2, 0, CANOPY_Y, dark, { edges: false }),
  );
  for (let x = 2742; x < 3046; x += 36.5) {
    addTree(scene, toMetres(x), 121.7, 0.8, trunk, crown);
    addTree(scene, toMetres(x), 128.4, 0.8, trunk, crown);
  }
  addRect(scene, [2707, 1246, 3117, 1258], 0, BENCH_H, bench, { soft: true });
  addRect(scene, [2510, 1352, 3117, 1366], 0, BENCH_H, bench, { soft: true });
  addRect(scene, [2525, 1524, 3117, 1538], 0, BENCH_H, bench, { soft: true });
  for (let x = 2547; x < 3040; x += 36.5) addTree(scene, toMetres(x), 146.1, 0.8, trunk, crown);
  for (let x = 2512; x < 3075; x += 36.5) addTree(scene, toMetres(x), 159.9, 0.8, trunk, crown);
  addRect(scene, [2373, 1394, 2529, 1673], 0, 2.6, mass, { soft: true });
  const [sx1, sz1, sx2, sz2] = [3150, 1110, 3275, 1188].map(toMetres) as [
    number,
    number,
    number,
    number,
  ];
  addBox(scene, sx1, sz1, sx2, sz2, 0, 2.2, mass, { rot: CANOPY_ROT });
  addRect(scene, [1293, 350, 1553, 607], 0, 0.04, pad, { cast: false, edges: false });
  addRect(scene, [3212, 1367, 3376, 1531], 0, 0.04, pad, { cast: false, edges: false });
  addPath(scene, dark);
};
