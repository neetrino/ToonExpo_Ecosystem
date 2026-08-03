import { MeshStandardMaterial, type Mesh, type Object3D } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import {
  THREE_MATERIAL_MAX_METALNESS,
  THREE_MATERIAL_MIN_ROUGHNESS,
} from '@/features/geo-map/three/constants';
import { prepareModelForMap } from '@/features/geo-map/three/prepare-model-for-map';

const loader = new GLTFLoader();

const resolveAbsoluteUrl = (url: string): string => {
  if (typeof window !== 'undefined' && url.startsWith('/')) {
    return `${window.location.origin}${url}`;
  }
  return url;
};

/** Soften extreme PBR values so textures read clearly on the shared MapLibre framebuffer. */
export const softenStandardMaterials = (root: Object3D): void => {
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) {
      return;
    }
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (!(material instanceof MeshStandardMaterial)) {
        continue;
      }
      material.metalness = Math.min(material.metalness, THREE_MATERIAL_MAX_METALNESS);
      material.roughness = Math.max(material.roughness, THREE_MATERIAL_MIN_ROUGHNESS);
      material.needsUpdate = true;
    }
  });
};

/** Load a GLB/GLTF scene, soften materials, and ground the model for MapLibre. */
export const loadPreparedGlbModel = async (modelUrl: string): Promise<Object3D> => {
  const gltf = await loader.loadAsync(resolveAbsoluteUrl(modelUrl));
  const root = gltf.scene;
  softenStandardMaterials(root);
  prepareModelForMap(root);
  return root;
};
