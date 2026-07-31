import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { CITY_MAP_CUSTOM_LAYER_ID, degToRad, type CityMapModelPose } from '../constants';

type LoadedEntry = {
  pose: CityMapModelPose;
  root: THREE.Object3D;
};

const disposeObject = (object: THREE.Object3D): void => {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }
    child.geometry?.dispose();
    const material = child.material;
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
    } else {
      material?.dispose();
    }
  });
};

const createPlaceholderBuilding = (): THREE.Object3D => {
  const geometry = new THREE.BoxGeometry(8, 18, 8);
  const material = new THREE.MeshStandardMaterial({
    color: 0x1f3a5f,
    metalness: 0.1,
    roughness: 0.75,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 9;
  const group = new THREE.Group();
  group.add(mesh);
  return group;
};

const applyPoseMatrix = (root: THREE.Object3D, pose: CityMapModelPose): void => {
  const mercator = maplibregl.MercatorCoordinate.fromLngLat(
    [pose.longitude, pose.latitude],
    pose.altitude,
  );
  const meter = mercator.meterInMercatorCoordinateUnits();
  const scale = meter * pose.scale;
  const rotationX = new THREE.Matrix4().makeRotationAxis(
    new THREE.Vector3(1, 0, 0),
    degToRad(pose.rotationX),
  );
  const rotationY = new THREE.Matrix4().makeRotationAxis(
    new THREE.Vector3(0, 1, 0),
    degToRad(pose.rotationY),
  );
  const rotationZ = new THREE.Matrix4().makeRotationAxis(
    new THREE.Vector3(0, 0, 1),
    degToRad(pose.rotationZ),
  );
  const scaleMatrix = new THREE.Matrix4().makeScale(scale, -scale, scale);
  const translation = new THREE.Matrix4().makeTranslation(mercator.x, mercator.y, mercator.z);
  const matrix = new THREE.Matrix4()
    .multiply(translation)
    .multiply(scaleMatrix)
    .multiply(rotationX)
    .multiply(rotationY)
    .multiply(rotationZ);
  root.matrix = matrix;
  root.matrixAutoUpdate = false;
};

export type CityMapGlbLayerHandle = {
  setModels: (poses: CityMapModelPose[]) => void;
  updatePose: (pose: CityMapModelPose) => void;
  destroy: () => void;
};

export const createCityMapGlbLayer = (map: MapLibreMap): CityMapGlbLayerHandle => {
  const camera = new THREE.Camera();
  const scene = new THREE.Scene();
  const loader = new GLTFLoader();
  const entries = new Map<string, LoadedEntry>();
  let renderer: THREE.WebGLRenderer | null = null;

  const ambient = new THREE.AmbientLight(0xffffff, 0.85);
  const directional = new THREE.DirectionalLight(0xffffff, 0.65);
  directional.position.set(50, 80, 30);
  scene.add(ambient);
  scene.add(directional);

  const syncVisibility = (): void => {
    const zoom = map.getZoom();
    for (const entry of entries.values()) {
      entry.root.visible = zoom >= entry.pose.minZoom;
    }
  };

  const loadPose = async (pose: CityMapModelPose): Promise<void> => {
    const existing = entries.get(pose.id);
    if (existing) {
      scene.remove(existing.root);
      disposeObject(existing.root);
      entries.delete(pose.id);
    }

    let root: THREE.Object3D;
    try {
      const gltf = await loader.loadAsync(pose.glbUrl);
      root = gltf.scene;
    } catch {
      root = createPlaceholderBuilding();
    }

    applyPoseMatrix(root, pose);
    scene.add(root);
    entries.set(pose.id, { pose, root });
    syncVisibility();
    map.triggerRepaint();
  };

  const customLayer: maplibregl.CustomLayerInterface = {
    id: CITY_MAP_CUSTOM_LAYER_ID,
    type: 'custom',
    renderingMode: '3d',
    onAdd: (_map, gl) => {
      renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true,
      });
      renderer.autoClear = false;
    },
    render: (_gl, args) => {
      if (!renderer) {
        return;
      }
      const matrix = (args as { defaultProjectionData?: { mainMatrix?: number[] } })
        .defaultProjectionData?.mainMatrix;
      if (!matrix) {
        return;
      }
      syncVisibility();
      camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
      renderer.resetState();
      renderer.render(scene, camera);
    },
    onRemove: () => {
      for (const entry of entries.values()) {
        scene.remove(entry.root);
        disposeObject(entry.root);
      }
      entries.clear();
      renderer?.dispose();
      renderer = null;
    },
  };

  if (!map.getLayer(CITY_MAP_CUSTOM_LAYER_ID)) {
    map.addLayer(customLayer);
  }

  const onZoom = (): void => {
    syncVisibility();
    map.triggerRepaint();
  };
  map.on('zoom', onZoom);

  return {
    setModels: (poses) => {
      const nextIds = new Set(poses.map((pose) => pose.id));
      for (const [id, entry] of entries) {
        if (!nextIds.has(id)) {
          scene.remove(entry.root);
          disposeObject(entry.root);
          entries.delete(id);
        }
      }
      void Promise.all(poses.map((pose) => loadPose(pose)));
    },
    updatePose: (pose) => {
      const entry = entries.get(pose.id);
      if (!entry) {
        void loadPose(pose);
        return;
      }
      entry.pose = pose;
      applyPoseMatrix(entry.root, pose);
      syncVisibility();
      map.triggerRepaint();
    },
    destroy: () => {
      map.off('zoom', onZoom);
      if (map.getLayer(CITY_MAP_CUSTOM_LAYER_ID)) {
        map.removeLayer(CITY_MAP_CUSTOM_LAYER_ID);
      }
    },
  };
};
