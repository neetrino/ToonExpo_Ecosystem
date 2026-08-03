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

import { GRASS_TEXTURE_URL } from '@/features/geo-map/vegetation/grass-config';

export type GrassPartTemplate = {
  geometry: BufferGeometry;
  material: Material;
  localMatrix: Matrix4;
};

export type GrassTemplate = {
  parts: GrassPartTemplate[];
  triangleCount: number;
};

let templatePromise: Promise<GrassTemplate> | null = null;
let template: GrassTemplate | null = null;
let ownedTexture: Texture | null = null;

export const preloadGrassTemplate = (): Promise<GrassTemplate> => {
  if (template) {
    return Promise.resolve(template);
  }
  if (templatePromise) {
    return templatePromise;
  }

  templatePromise = (async () => {
    const texture = await new TextureLoader().loadAsync(GRASS_TEXTURE_URL);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 2;
    texture.needsUpdate = true;
    ownedTexture = texture;

    const geometry = new PlaneGeometry(1, 1);
    geometry.translate(0, 0.5, 0);
    const material = new MeshStandardMaterial({
      map: texture,
      color: 0xffffff,
      roughness: 0.95,
      metalness: 0,
      side: DoubleSide,
      transparent: false,
      alphaTest: 0.35,
      depthWrite: true,
      depthTest: true,
    });

    template = {
      triangleCount: 2,
      parts: [{ geometry, material, localMatrix: new Matrix4() }],
    };
    return template;
  })().catch((error: unknown) => {
    templatePromise = null;
    throw error;
  });

  return templatePromise;
};

export const getGrassTemplate = (): GrassTemplate | null => template;

export const disposeGrassTemplate = (): void => {
  if (!template) {
    return;
  }
  for (const part of template.parts) {
    part.geometry.dispose();
    part.material.dispose();
  }
  ownedTexture?.dispose();
  ownedTexture = null;
  template = null;
  templatePromise = null;
};
