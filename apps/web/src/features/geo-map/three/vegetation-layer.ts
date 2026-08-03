import {
  type CustomLayerInterface,
  type CustomRenderMethodInput,
  type MapLibreMap,
  MercatorCoordinate,
} from 'maplibre-gl';
import {
  AmbientLight,
  Camera,
  DirectionalLight,
  Matrix4,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';

import {
  createGrassInstancing,
  type GrassInstancing,
} from '@/features/geo-map/vegetation/grass-instancing';
import {
  getGrassTemplate,
  preloadGrassTemplate,
} from '@/features/geo-map/vegetation/grass-model-loader';
import {
  createVegetationInstancing,
  type VegetationInstancing,
} from '@/features/geo-map/vegetation/tree-instancing';
import {
  getTreeTemplates,
  preloadTreeTemplates,
} from '@/features/geo-map/vegetation/tree-model-loader';
import type { GrassInstanceSpec, TreeInstanceSpec } from '@/features/geo-map/vegetation/types';
import { VEGETATION_LAYER_ID } from '@/features/geo-map/vegetation/vegetation-config';
import { DEFAULT_GRASS_CONFIG } from '@/features/geo-map/vegetation/grass-config';

/**
 * MapLibre custom layer: instanced billboard trees + grass around map center.
 * Wind animation intentionally omitted (jank risk); enable later at zoom ≥18.
 */
export class VegetationLayer implements CustomLayerInterface {
  readonly id = VEGETATION_LAYER_ID;
  readonly type = 'custom' as const;
  readonly renderingMode = '3d' as const;

  private map: MapLibreMap | null = null;
  private renderer: WebGLRenderer | null = null;
  private scene = new Scene();
  private camera = new Camera();
  private enabled = true;
  private grassVisible = true;
  private contextLost = false;
  private templatesReady = false;
  private pendingTrees: TreeInstanceSpec[] | null = null;
  private pendingGrass: GrassInstanceSpec[] | null = null;
  private instancing: VegetationInstancing | null = null;
  private grassInstancing: GrassInstancing | null = null;
  private groundOffset = 0.05;
  private grassGroundOffset = DEFAULT_GRASS_CONFIG.groundOffsetMeters;
  private lastPoseKey = '';
  private posesDirty = true;
  private readonly tmpMain = new Matrix4();
  private readonly tmpModel = new Matrix4();

  onAdd(map: MapLibreMap, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    this.map = map;
    this.camera = new Camera();
    this.scene = new Scene();
    this.addLights();
    this.renderer = new WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl as WebGLRenderingContext,
      antialias: false,
    });
    this.renderer.autoClear = false;
    map.getCanvas().addEventListener('webglcontextlost', this.onContextLost);
    map.getCanvas().addEventListener('webglcontextrestored', this.onContextRestored);

    void Promise.all([preloadTreeTemplates(), preloadGrassTemplate()])
      .then(() => {
        this.templatesReady = true;
        if (this.pendingTrees) {
          this.applyTreeInstances(this.pendingTrees);
          this.pendingTrees = null;
        }
        if (this.pendingGrass) {
          this.applyGrassInstances(this.pendingGrass);
          this.pendingGrass = null;
        }
        this.map?.triggerRepaint();
      })
      .catch(() => {
        /* templates failed — layer stays empty */
      });
  }

  onRemove(): void {
    this.map?.getCanvas().removeEventListener('webglcontextlost', this.onContextLost);
    this.map?.getCanvas().removeEventListener('webglcontextrestored', this.onContextRestored);
    this.instancing?.dispose();
    this.instancing = null;
    this.grassInstancing?.dispose();
    this.grassInstancing = null;
    this.scene.clear();
    this.renderer?.dispose();
    this.renderer = null;
    this.map = null;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    for (const mesh of this.instancing?.meshes ?? []) {
      mesh.visible = enabled;
    }
    for (const mesh of this.grassInstancing?.meshes ?? []) {
      mesh.visible = enabled && this.grassVisible;
    }
    this.map?.triggerRepaint();
  }

  setGrassVisible(visible: boolean): void {
    this.grassVisible = visible;
    for (const mesh of this.grassInstancing?.meshes ?? []) {
      mesh.visible = this.enabled && visible;
    }
    this.map?.triggerRepaint();
  }

  setGroundOffset(meters: number): void {
    this.groundOffset = meters;
  }

  setInstances(instances: TreeInstanceSpec[]): void {
    if (!this.templatesReady) {
      this.pendingTrees = instances;
      return;
    }
    this.applyTreeInstances(instances);
    this.map?.triggerRepaint();
  }

  setGrassInstances(instances: GrassInstanceSpec[]): void {
    if (!this.templatesReady) {
      this.pendingGrass = instances;
      return;
    }
    this.applyGrassInstances(instances);
    this.map?.triggerRepaint();
  }

  render(_gl: WebGLRenderingContext | WebGL2RenderingContext, args: CustomRenderMethodInput): void {
    if (!this.renderer || !this.map || this.contextLost || !this.enabled) {
      return;
    }
    const hasFleet = Boolean(this.instancing && this.instancing.meshes.length > 0);
    const hasGrass = Boolean(this.grassInstancing && this.grassInstancing.meshes.length > 0);
    if (!hasFleet && !hasGrass) {
      return;
    }

    const center = this.map.getCenter();
    this.syncInstancePoses(center.lng, center.lat);
    this.bindVisibility();
    this.setCenterProjection(center.lng, center.lat, args);
    this.renderer.resetState();
    this.renderer.render(this.scene, this.camera);
  }

  private bindVisibility(): void {
    if (this.instancing) {
      for (const mesh of this.instancing.meshes) {
        mesh.visible = true;
      }
    }
    if (this.grassInstancing) {
      for (const mesh of this.grassInstancing.meshes) {
        mesh.visible = this.grassVisible;
      }
    }
  }

  private setCenterProjection(lng: number, lat: number, args: CustomRenderMethodInput): void {
    const mercator = MercatorCoordinate.fromLngLat([lng, lat], 0);
    const scale = mercator.meterInMercatorCoordinateUnits();
    this.tmpModel
      .makeTranslation(mercator.x, mercator.y, mercator.z ?? 0)
      .scale(new Vector3(scale, -scale, scale));
    this.tmpMain.fromArray(args.defaultProjectionData.mainMatrix);
    this.camera.projectionMatrix.copy(this.tmpMain.multiply(this.tmpModel));
  }

  private applyTreeInstances(instances: TreeInstanceSpec[]): void {
    this.instancing?.dispose();
    this.instancing = null;
    this.posesDirty = true;
    if (instances.length === 0) {
      return;
    }
    const templates = getTreeTemplates();
    if (!templates) {
      return;
    }
    this.instancing = createVegetationInstancing(this.scene, templates, instances);
    if (this.map) {
      const center = this.map.getCenter();
      this.syncInstancePoses(center.lng, center.lat, true);
    }
  }

  private applyGrassInstances(instances: GrassInstanceSpec[]): void {
    this.grassInstancing?.dispose();
    this.grassInstancing = null;
    this.posesDirty = true;
    if (instances.length === 0) {
      return;
    }
    const grassTemplate = getGrassTemplate();
    if (!grassTemplate) {
      return;
    }
    this.grassInstancing = createGrassInstancing(this.scene, grassTemplate, instances);
    if (this.map) {
      const center = this.map.getCenter();
      this.syncInstancePoses(center.lng, center.lat, true);
    }
  }

  private syncInstancePoses(lng: number, lat: number, force = false): void {
    const key = `${lng.toFixed(6)},${lat.toFixed(6)}`;
    if (!force && !this.posesDirty && key === this.lastPoseKey) {
      return;
    }
    this.lastPoseKey = key;
    this.posesDirty = false;
    this.instancing?.updatePoses(lng, lat, this.groundOffset);
    if (this.grassVisible) {
      this.grassInstancing?.updatePoses(lng, lat, this.grassGroundOffset);
    }
  }

  private addLights(): void {
    const key = new DirectionalLight(0xffffff, 1.2);
    key.position.set(40, 80, 30);
    const fill = new DirectionalLight(0xffffff, 0.55);
    fill.position.set(-30, 40, -20);
    this.scene.add(key, fill, new AmbientLight(0xffffff, 0.7));
  }

  private readonly onContextLost = (event: Event): void => {
    event.preventDefault();
    this.contextLost = true;
  };

  private readonly onContextRestored = (): void => {
    this.contextLost = false;
    this.map?.triggerRepaint();
  };
}

const layersByMap = new WeakMap<MapLibreMap, VegetationLayer>();

export const ensureVegetationLayer = (map: MapLibreMap): VegetationLayer => {
  const existing = layersByMap.get(map);
  if (existing && map.getLayer(VEGETATION_LAYER_ID)) {
    return existing;
  }
  if (map.getLayer(VEGETATION_LAYER_ID)) {
    map.removeLayer(VEGETATION_LAYER_ID);
  }
  const layer = new VegetationLayer();
  map.addLayer(layer);
  layersByMap.set(map, layer);
  return layer;
};

export const removeVegetationLayer = (map: MapLibreMap): void => {
  if (map.getLayer(VEGETATION_LAYER_ID)) {
    map.removeLayer(VEGETATION_LAYER_ID);
  }
  layersByMap.delete(map);
};
