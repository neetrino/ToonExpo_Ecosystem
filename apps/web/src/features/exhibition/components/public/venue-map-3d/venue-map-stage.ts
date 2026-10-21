import {
  Color,
  DirectionalLight,
  HemisphereLight,
  NoToneMapping,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

import type { VenueBooth } from '@/features/exhibition/components/public/venue-map-3d/venue-map-booths';
import {
  addVenueBooths,
  type VenueBoothMesh,
} from '@/features/exhibition/components/public/venue-map-3d/venue-map-booth-meshes';
import { addVenueShell } from '@/features/exhibition/components/public/venue-map-3d/venue-map-shell';
import {
  VENUE_CAMERA_HOME,
  VENUE_PIXEL_RATIO_CAP,
  type VenueCamera,
} from '@/features/exhibition/components/public/venue-map-3d/venue-map-scene-math';
import { shadowBias } from '@/features/exhibition/components/public/venue-map-3d/venue-map-primitives';

const CAMERA_FOV = 32;
const CAMERA_NEAR = 1;
const CAMERA_FAR = 3000;
const SHADOW_MAP = 4096;
/** r128 HTML intensities, scaled for current Three.js light units. */
const LIGHT_UNIT = Math.PI;
const LIGHT_HEMI = 0.56 * LIGHT_UNIT;
const LIGHT_SUN = 0.5 * LIGHT_UNIT;
const SCENE_BACKGROUND = '#eef1f4';

export type VenueMapStage = {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  booths: VenueBoothMesh[];
  cameraState: VenueCamera;
  cameraGoal: VenueCamera;
  raycaster: Raycaster;
  pointer: Vector2;
  scratch: Vector3;
  dispose: () => void;
};

const addLights = (scene: Scene): void => {
  scene.add(new HemisphereLight(0xffffff, 0xc5cfdb, LIGHT_HEMI));
  const sun = new DirectionalLight(0xffffff, LIGHT_SUN);
  sun.position.set(-90, 170, -60);
  sun.castShadow = true;
  sun.shadow.mapSize.set(SHADOW_MAP, SHADOW_MAP);
  Object.assign(sun.shadow.camera, {
    left: -210,
    right: 210,
    top: 140,
    bottom: -140,
    near: 10,
    far: 600,
  });
  sun.shadow.bias = shadowBias;
  scene.add(sun);
};

export const createVenueMapStage = (host: HTMLElement, booths: VenueBooth[]): VenueMapStage => {
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, VENUE_PIXEL_RATIO_CAP));
  renderer.toneMapping = NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  host.prepend(renderer.domElement);

  const scene = new Scene();
  scene.background = new Color(SCENE_BACKGROUND);
  renderer.setClearColor(SCENE_BACKGROUND);
  const camera = new PerspectiveCamera(CAMERA_FOV, 1, CAMERA_NEAR, CAMERA_FAR);
  addLights(scene);
  addVenueShell(scene);
  const boothMeshes = addVenueBooths(scene, booths);

  return {
    renderer,
    scene,
    camera,
    booths: boothMeshes,
    cameraState: { ...VENUE_CAMERA_HOME },
    cameraGoal: { ...VENUE_CAMERA_HOME },
    raycaster: new Raycaster(),
    pointer: new Vector2(),
    scratch: new Vector3(),
    dispose: () => {
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
};

export const applyVenueCamera = (stage: VenueMapStage): void => {
  const { camera, cameraState: cur } = stage;
  const lift = Math.sin(cur.pol);
  camera.position.set(
    cur.tx + cur.dist * lift * Math.sin(cur.az),
    cur.dist * Math.cos(cur.pol),
    cur.tz + cur.dist * lift * Math.cos(cur.az),
  );
  camera.lookAt(cur.tx, 0, cur.tz);
};

export const resizeVenueStage = (stage: VenueMapStage, width: number, height: number): void => {
  stage.renderer.setSize(width, height, false);
  stage.camera.aspect = width / Math.max(height, 1);
  stage.camera.updateProjectionMatrix();
};
