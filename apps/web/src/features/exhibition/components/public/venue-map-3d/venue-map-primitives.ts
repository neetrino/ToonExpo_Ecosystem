import {
  BoxGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  EdgesGeometry,
  ExtrudeGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  type Scene,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from 'three';

import type { VenueRect } from '@/features/exhibition/components/public/venue-map-3d/venue-map-booths';
import {
  toMetres,
  worldX,
  worldZ,
} from '@/features/exhibition/components/public/venue-map-3d/venue-map-scene-math';

const EDGE_OPACITY = 0.42;
const EDGE_SOFT_OPACITY = 0.35;
const SHADOW_BIAS = -0.0004;

export const venueMaterial = (color: string): MeshStandardMaterial =>
  new MeshStandardMaterial({ color, roughness: 0.95, metalness: 0 });

const edgeMat = new LineBasicMaterial({
  color: 0x192643,
  transparent: true,
  opacity: EDGE_OPACITY,
});

const edgeSoft = new LineBasicMaterial({
  color: 0x8d9ab0,
  transparent: true,
  opacity: EDGE_SOFT_OPACITY,
});

type BoxOptions = {
  rot?: number;
  cast?: boolean;
  edges?: boolean;
  soft?: boolean;
};

export const addBox = (
  scene: Scene,
  x1: number,
  z1: number,
  x2: number,
  z2: number,
  y: number,
  height: number,
  material: MeshStandardMaterial,
  options: BoxOptions = {},
): Mesh => {
  const geometry = new BoxGeometry(Math.abs(x2 - x1), height, Math.abs(z2 - z1));
  const mesh = new Mesh(geometry, material);
  mesh.position.set(worldX((x1 + x2) / 2), y + height / 2, worldZ((z1 + z2) / 2));
  if (options.rot) mesh.rotation.y = options.rot;
  mesh.castShadow = options.cast !== false;
  mesh.receiveShadow = true;
  if (options.edges !== false) {
    const line = new LineSegments(new EdgesGeometry(geometry), options.soft ? edgeSoft : edgeMat);
    mesh.add(line);
  }
  scene.add(mesh);
  return mesh;
};

export const addRect = (
  scene: Scene,
  rect: VenueRect,
  y: number,
  height: number,
  material: MeshStandardMaterial,
  options: BoxOptions = {},
): Mesh => {
  const [x1, z1, x2, z2] = rect;
  return addBox(
    scene,
    toMetres(x1),
    toMetres(z1),
    toMetres(x2),
    toMetres(z2),
    y,
    height,
    material,
    options,
  );
};

export const addTree = (
  scene: Scene,
  xMetres: number,
  zMetres: number,
  radius: number,
  trunk: MeshStandardMaterial,
  crown: MeshStandardMaterial,
): void => {
  const trunkMesh = new Mesh(new CylinderGeometry(0.14, 0.18, 1.2, 6), trunk);
  trunkMesh.position.set(worldX(xMetres), 0.6, worldZ(zMetres));
  trunkMesh.castShadow = true;
  scene.add(trunkMesh);
  const crownMesh = new Mesh(new SphereGeometry(radius, 14, 10), crown);
  crownMesh.position.set(worldX(xMetres), 1.2 + radius * 0.85, worldZ(zMetres));
  crownMesh.castShadow = true;
  scene.add(crownMesh);
};

export const addPark = (
  scene: Scene,
  material: MeshStandardMaterial,
  treeMat: MeshStandardMaterial,
  trunk: MeshStandardMaterial,
): void => {
  const points: Array<[number, number]> = [
    [-200, -150],
    [600, -150],
    [600, 110.7],
    [382.8, 110.7],
    [194.1, 34.2],
    [46.5, 7.7],
    [0, 16.4],
    [-200, 16.4],
  ];
  const shape = new Shape();
  points.forEach(([x, z], index) => {
    const px = worldX(x);
    const pz = -worldZ(z);
    if (index === 0) shape.moveTo(px, pz);
    else shape.lineTo(px, pz);
  });
  const mesh = new Mesh(new ExtrudeGeometry(shape, { depth: 0.15, bevelEnabled: false }), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);
  scatterTrees(scene, treeMat, trunk);
};

const TREE_COUNT = 120;
const PARK_EDGE_X = 46.5;
const PARK_MID_X = 194.1;

const edgeZ = (x: number): number => {
  if (x < PARK_EDGE_X) return 16.4 - (x / PARK_EDGE_X) * 8.7;
  if (x < PARK_MID_X) return 7.7 + ((x - PARK_EDGE_X) / 147.6) * 26.5;
  return 34.2 + ((x - PARK_MID_X) / 188.7) * 76.5;
};

const scatterTrees = (
  scene: Scene,
  crown: MeshStandardMaterial,
  trunk: MeshStandardMaterial,
): void => {
  let seed = 11;
  const rnd = (): number => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let index = 0; index < TREE_COUNT; index += 1) {
    const x = rnd() * 382;
    const z = -2 + rnd() * 112;
    if (z < edgeZ(x) - 3) addTree(scene, x, z, 1.2 + rnd(), trunk, crown);
  }
};

export const addArrow = (scene: Scene, x: number, material: MeshStandardMaterial): void => {
  const shape = new Shape();
  shape.moveTo(0, -0.7);
  shape.lineTo(3, -0.7);
  shape.lineTo(3, -1.6);
  shape.lineTo(5, 0);
  shape.lineTo(3, 1.6);
  shape.lineTo(3, 0.7);
  shape.lineTo(0, 0.7);
  const mesh = new Mesh(new ShapeGeometry(shape), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(worldX(x), 0.08, worldZ(157.5));
  scene.add(mesh);
};

export const addPath = (scene: Scene, material: MeshStandardMaterial): void => {
  const points: Array<[number, number]> = [
    [2373, 786],
    [2560, 790],
    [2700, 860],
    [2760, 1000],
  ];
  const curvePoints = points.map(
    ([x, z]) => new Vector3(worldX(toMetres(x)), 0.06, worldZ(toMetres(z))),
  );
  const curve = new CatmullRomCurve3(curvePoints);
  scene.add(new Mesh(new TubeGeometry(curve, 40, 0.25, 6, false), material));
};

export const shadowBias = SHADOW_BIAS;
