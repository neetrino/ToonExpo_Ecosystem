import {
  Box3,
  ClampToEdgeWrapping,
  Color,
  DoubleSide,
  Group,
  LoadingManager,
  Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  type Object3D,
  type Texture,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import {
  CAR_COLORMAP_URL,
  CAR_MODEL_URLS,
  CAR_SCENE_SCALE,
} from '@/features/geo-map/traffic/traffic-config';

const loadingManager = new LoadingManager();
loadingManager.setURLModifier((url) => {
  if (url.includes('colormap.png')) {
    return CAR_COLORMAP_URL;
  }
  return url;
});

const gltfLoader = new GLTFLoader(loadingManager);
const textureLoader = new TextureLoader(loadingManager);

let templatesPromise: Promise<Group[]> | null = null;
let templates: Group[] | null = null;
let sharedColormap: Texture | null = null;

export const preloadCarTemplates = (): Promise<Group[]> => {
  if (templates) {
    return Promise.resolve(templates);
  }
  if (templatesPromise) {
    return templatesPromise;
  }

  templatesPromise = (async () => {
    sharedColormap = await textureLoader.loadAsync(CAR_COLORMAP_URL);
    sharedColormap.colorSpace = SRGBColorSpace;
    sharedColormap.flipY = false;
    sharedColormap.wrapS = ClampToEdgeWrapping;
    sharedColormap.wrapT = ClampToEdgeWrapping;
    sharedColormap.needsUpdate = true;

    const loaded: Group[] = [];
    for (const url of CAR_MODEL_URLS) {
      const gltf = await gltfLoader.loadAsync(url);
      loaded.push(normalizeCarTemplate(gltf.scene, url, sharedColormap));
    }
    templates = loaded;
    return loaded;
  })().catch((error: unknown) => {
    templatesPromise = null;
    throw error;
  });

  return templatesPromise;
};

export const cloneCarModel = (modelIndex: number): Group | null => {
  if (!templates || templates.length === 0) {
    return null;
  }
  const template =
    templates[((modelIndex % templates.length) + templates.length) % templates.length]!;
  const clone = template.clone(true);
  clone.scale.setScalar(CAR_SCENE_SCALE);
  clone.visible = true;
  return clone;
};

export const disposeCarTemplates = (): void => {
  templates = null;
  templatesPromise = null;
  sharedColormap?.dispose();
  sharedColormap = null;
};

const normalizeCarTemplate = (scene: Object3D, url: string, colormap: Texture): Group => {
  const root = new Group();
  root.name = `car:${url}`;
  root.add(scene);
  root.updateMatrixWorld(true);
  const box = new Box3().setFromObject(root);
  const center = box.getCenter(new Vector3());
  scene.position.x -= center.x;
  scene.position.z -= center.z;
  scene.position.y -= box.min.y;

  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) {
      return;
    }
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      if (!(mat instanceof MeshStandardMaterial)) {
        continue;
      }
      mat.map = colormap;
      mat.color = new Color(0xffffff);
      mat.metalness = 0.2;
      mat.roughness = 0.45;
      mat.side = DoubleSide;
      mat.needsUpdate = true;
    }
    mesh.frustumCulled = false;
  });

  root.updateMatrixWorld(true);
  return root;
};
