import {
  DoubleSide,
  Matrix4,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  TextureLoader,
  type BufferGeometry,
  type Material,
  type Texture,
} from 'three';

import type { TreeSpeciesId } from '@/features/geo-map/vegetation/types';
import { TREE_SPECIES_ASSETS } from '@/features/geo-map/vegetation/vegetation-config';

export type TreePartTemplate = {
  geometry: BufferGeometry;
  material: Material;
  localMatrix: Matrix4;
};

export type TreeSpeciesTemplate = {
  id: TreeSpeciesId;
  parts: TreePartTemplate[];
  triangleCount: number;
};

const textureLoader = new TextureLoader();
let templatesPromise: Promise<Map<TreeSpeciesId, TreeSpeciesTemplate>> | null = null;
let templates: Map<TreeSpeciesId, TreeSpeciesTemplate> | null = null;
const ownedTextures: Texture[] = [];

export const preloadTreeTemplates = (): Promise<Map<TreeSpeciesId, TreeSpeciesTemplate>> => {
  if (templates) {
    return Promise.resolve(templates);
  }
  if (templatesPromise) {
    return templatesPromise;
  }

  templatesPromise = (async () => {
    const map = new Map<TreeSpeciesId, TreeSpeciesTemplate>();
    for (const id of Object.keys(TREE_SPECIES_ASSETS) as TreeSpeciesId[]) {
      map.set(id, await buildBillboardSpecies(id));
    }
    templates = map;
    return map;
  })().catch((error: unknown) => {
    templatesPromise = null;
    throw error;
  });

  return templatesPromise;
};

export const getTreeTemplates = (): Map<TreeSpeciesId, TreeSpeciesTemplate> | null => templates;

export const disposeTreeTemplates = (): void => {
  if (!templates) {
    return;
  }
  const geos = new Set<BufferGeometry>();
  const mats = new Set<Material>();
  for (const species of templates.values()) {
    for (const part of species.parts) {
      geos.add(part.geometry);
      mats.add(part.material);
    }
  }
  for (const geo of geos) {
    geo.dispose();
  }
  for (const mat of mats) {
    mat.dispose();
  }
  for (const tex of ownedTextures) {
    tex.dispose();
  }
  ownedTextures.length = 0;
  templates = null;
  templatesPromise = null;
};

const buildBillboardSpecies = async (id: TreeSpeciesId): Promise<TreeSpeciesTemplate> => {
  const meta = TREE_SPECIES_ASSETS[id];
  const texture = await textureLoader.loadAsync(meta.textureUrl);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  ownedTextures.push(texture);

  const material = new MeshStandardMaterial({
    map: texture,
    color: 0xffffff,
    roughness: 0.92,
    metalness: 0,
    side: DoubleSide,
    transparent: false,
    alphaTest: 0.42,
    depthWrite: true,
    depthTest: true,
  });

  const geometry = new PlaneGeometry(meta.targetWidthM, meta.targetHeightM);
  geometry.translate(0, meta.targetHeightM / 2, 0);

  return {
    id,
    triangleCount: 4,
    parts: [
      { geometry, material, localMatrix: new Matrix4() },
      { geometry, material, localMatrix: new Matrix4().makeRotationY(Math.PI / 2) },
    ],
  };
};
