import { Vector3, type Mesh, type MeshStandardMaterial, type Scene } from 'three';

import type { VenueBooth } from '@/features/exhibition/components/public/venue-map-3d/venue-map-booths';
import {
  addBox,
  venueMaterial,
} from '@/features/exhibition/components/public/venue-map-3d/venue-map-primitives';
import {
  toMetres,
  worldX,
  worldZ,
} from '@/features/exhibition/components/public/venue-map-3d/venue-map-scene-math';

const BOOTH_BASE = 0.3;
const OPEN_HEIGHT = 0.6;
const BIG_HEIGHT = 1.9;
const TALL_HEIGHT = 1.5;
const SHORT_HEIGHT = 1.2;
const TALL_AREA = 100;

export const BOOTH_COLORS = {
  base: 0xc4c8cd,
  open: 0xd7dadd,
  hover: 0x9cc0ca,
  selected: 0x027691,
  svc: 0xc4ccd0,
  big: 0xbcc0c6,
} as const;

export type VenueBoothMesh = {
  booth: VenueBooth;
  material: MeshStandardMaterial;
  meshes: Mesh[];
  top: Vector3;
  height: number;
  lift: number;
};

const boothHeight = (booth: VenueBooth): number => {
  if (!booth.name) return OPEN_HEIGHT;
  if (booth.kind === 'big') return BIG_HEIGHT;
  if (booth.sqm !== null && booth.sqm >= TALL_AREA) return TALL_HEIGHT;
  return SHORT_HEIGHT;
};

const colorFor = (booth: VenueBooth): number => {
  if (booth.kind === 'svc') return BOOTH_COLORS.svc;
  if (!booth.name) return BOOTH_COLORS.open;
  if (booth.kind === 'big') return BOOTH_COLORS.big;
  return BOOTH_COLORS.base;
};

export const addVenueBooths = (scene: Scene, booths: VenueBooth[]): VenueBoothMesh[] =>
  booths.map((booth) => {
    const height = boothHeight(booth);
    const material = venueMaterial('#ffffff');
    material.color.setHex(colorFor(booth));
    material.transparent = true;
    const meshes = booth.parts.map((part) => {
      const [rawX1, rawZ1, rawX2, rawZ2] = part;
      const mesh = addBox(
        scene,
        toMetres(rawX1),
        toMetres(rawZ1),
        toMetres(rawX2),
        toMetres(rawZ2),
        BOOTH_BASE,
        height,
        material,
      );
      mesh.userData['boothId'] = booth.id;
      return mesh;
    });
    const main = booth.parts[0];
    if (!main) return { booth, material, meshes, top: new Vector3(), height, lift: 0 };
    const [rawX1, rawZ1, rawX2, rawZ2] = main;
    const x1 = toMetres(rawX1);
    const z1 = toMetres(rawZ1);
    const x2 = toMetres(rawX2);
    const z2 = toMetres(rawZ2);
    const top = new Vector3(worldX((x1 + x2) / 2), BOOTH_BASE + height, worldZ((z1 + z2) / 2));
    return { booth, material, meshes, top, height, lift: 0 };
  });
