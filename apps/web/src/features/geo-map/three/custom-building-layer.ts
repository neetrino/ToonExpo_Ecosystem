import {
  type CustomLayerInterface,
  type CustomRenderMethodInput,
  type MapLibreMap,
  MercatorCoordinate,
} from 'maplibre-gl';
import {
  AmbientLight,
  Camera,
  type InstancedMesh,
  type Object3D,
  Scene,
  WebGLRenderer,
} from 'three';

import {
  THREE_AMBIENT_LIGHT_INTENSITY,
  THREE_BUILDING_LAYER_ID,
} from '@/features/geo-map/three/constants';
import { disposeThreeObject } from '@/features/geo-map/three/dispose-three-object';
import { loadPreparedGlbModel } from '@/features/geo-map/three/load-glb-model';
import {
  composeCameraProjectionMatrix,
  composeModelTransformMatrix,
} from '@/features/geo-map/three/model-transform-matrix';
import {
  createBuildingCanopyMesh,
  disposeBuildingCanopyMesh,
  renderBuildingCanopy,
  writeBuildingCanopyInstances,
} from '@/features/geo-map/three/building-layer-canopy';
import { BuildingTrafficController } from '@/features/geo-map/three/building-layer-traffic';
import type { GeoMapObject } from '@/features/geo-map/types';
import type { RoadTrafficState } from '@/features/geo-map/traffic/types';
import type { CanopyTreeInstance, GreenLngLat } from '@/features/geo-map/trees/types';

const canopySignature = (instances: readonly CanopyTreeInstance[], origin: GreenLngLat): string => {
  const first = instances[0];
  const last = instances[instances.length - 1];
  return [
    origin.longitude.toFixed(5),
    origin.latitude.toFixed(5),
    instances.length,
    first?.longitude.toFixed(5) ?? '0',
    last?.latitude.toFixed(5) ?? '0',
  ].join(':');
};

type ManagedModel = {
  config: GeoMapObject;
  object: Object3D | null;
  loading: boolean;
};

/**
 * MapLibre `CustomLayerInterface` that renders GLBs with Three.js using the
 * proven POC matrix: `projection = mainMatrix * translate * scale(s,-s,s) * Rx * Ry * Rz`.
 *
 * @see https://github.com/Manvel-Lambaryan/Map/blob/main/src/components/map/CustomBuildingLayer.ts
 */
export class ThreeBuildingLayer implements CustomLayerInterface {
  readonly id = THREE_BUILDING_LAYER_ID;
  readonly type = 'custom' as const;
  readonly renderingMode = '3d' as const;

  private map: MapLibreMap | null = null;
  private renderer: WebGLRenderer | null = null;
  private scene = new Scene();
  private camera = new Camera();
  private readonly models = new Map<string, ManagedModel>();
  private canopy: InstancedMesh | null = null;
  private canopyOrigin: GreenLngLat = { longitude: 0, latitude: 0 };
  private pendingCanopy: {
    instances: readonly CanopyTreeInstance[];
    origin: GreenLngLat;
  } | null = null;
  private canopySignature = '';
  private readonly traffic = new BuildingTrafficController();
  private contextLost = false;

  onAdd(map: MapLibreMap, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    this.map = map;
    this.camera = new Camera();
    this.scene = new Scene();
    this.addLights();
    if (this.pendingCanopy) {
      this.applyCanopy(this.pendingCanopy.instances, this.pendingCanopy.origin);
      this.pendingCanopy = null;
    }
    this.traffic.flushPending(this.scene);
    this.renderer = new WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl as WebGLRenderingContext,
      antialias: true,
    });
    this.renderer.autoClear = false;
    map.getCanvas().addEventListener('webglcontextlost', this.onContextLost);
    map.getCanvas().addEventListener('webglcontextrestored', this.onContextRestored);
  }

  onRemove(): void {
    const canvas = this.map?.getCanvas();
    canvas?.removeEventListener('webglcontextlost', this.onContextLost);
    canvas?.removeEventListener('webglcontextrestored', this.onContextRestored);
    for (const managed of this.models.values()) {
      this.disposeManaged(managed);
    }
    this.models.clear();
    disposeBuildingCanopyMesh(this.scene, this.canopy);
    this.canopy = null;
    this.traffic.dispose(this.scene);
    this.scene.clear();
    this.renderer?.dispose();
    this.renderer = null;
    this.map = null;
  }

  render(
    _gl: WebGLRenderingContext | WebGL2RenderingContext,
    options: CustomRenderMethodInput,
  ): void {
    if (!this.renderer || !this.map || this.contextLost) {
      return;
    }
    const visible = this.collectVisibleModels();
    for (const managed of visible) {
      this.renderOne(managed, visible, options);
    }
    for (const managed of visible) {
      if (managed.object) {
        managed.object.visible = false;
      }
    }
    if (this.canopy) {
      renderBuildingCanopy(
        this.renderer,
        this.scene,
        this.camera,
        this.canopy,
        this.canopyOrigin,
        options,
      );
    }
    if (this.traffic.render(this.renderer, this.scene, this.camera, options)) {
      this.map.triggerRepaint();
    }
    for (const managed of visible) {
      if (managed.object) {
        managed.object.visible = true;
      }
    }
  }

  /** Viewport park trees — same renderer as buildings, never a second WebGL context. */
  setCanopyInstances(instances: readonly CanopyTreeInstance[], origin: GreenLngLat): void {
    const signature = canopySignature(instances, origin);
    if (signature === this.canopySignature) {
      return;
    }
    this.canopySignature = signature;
    this.canopyOrigin = origin;
    if (!this.renderer) {
      this.pendingCanopy = { instances, origin };
      return;
    }
    this.applyCanopy(instances, origin);
    this.map?.triggerRepaint();
  }

  /** Viewport road cars — same renderer as buildings, never a second WebGL context. */
  setRoadTraffic(state: RoadTrafficState | null): void {
    this.traffic.setState(state, this.renderer ? this.scene : null);
    this.map?.triggerRepaint();
  }

  private applyCanopy(instances: readonly CanopyTreeInstance[], origin: GreenLngLat): void {
    if (instances.length === 0) {
      if (this.canopy) {
        this.canopy.count = 0;
      }
      return;
    }
    if (!this.canopy) {
      this.canopy = createBuildingCanopyMesh();
      this.scene.add(this.canopy);
    }
    writeBuildingCanopyInstances(this.canopy, instances, origin);
  }

  /** Sync viewport-visible (or admin-preview) model configs; loads new GLBs as needed. */
  setModels(configs: readonly GeoMapObject[]): void {
    const nextIds = new Set(configs.map((config) => config.id));
    for (const [id, managed] of this.models) {
      if (!nextIds.has(id)) {
        this.disposeManaged(managed);
        this.models.delete(id);
      }
    }
    for (const config of configs) {
      this.upsertModel(config);
    }
    this.map?.triggerRepaint();
  }

  private upsertModel(config: GeoMapObject): void {
    const existing = this.models.get(config.id);
    if (!existing) {
      this.models.set(config.id, { config: { ...config }, object: null, loading: false });
      void this.ensureLoaded(config.id);
      return;
    }
    const urlChanged = existing.config.modelUrl !== config.modelUrl;
    existing.config = { ...config };
    if (!urlChanged) {
      return;
    }
    this.disposeManaged(existing);
    existing.object = null;
    void this.ensureLoaded(config.id);
  }

  private collectVisibleModels(): ManagedModel[] {
    const visible: ManagedModel[] = [];
    for (const managed of this.models.values()) {
      if (!managed.object) {
        continue;
      }
      managed.object.visible = true;
      visible.push(managed);
    }
    return visible;
  }

  private renderOne(
    managed: ManagedModel,
    visible: ManagedModel[],
    options: CustomRenderMethodInput,
  ): void {
    if (!managed.object || !this.renderer) {
      return;
    }
    for (const other of visible) {
      if (other.object) {
        other.object.visible = other === managed;
      }
    }
    const projection = this.computeProjectionMatrix(managed.config, options);
    this.camera.projectionMatrix.copy(projection);
    this.renderer.resetState();
    this.renderer.render(this.scene, this.camera);
  }

  private computeProjectionMatrix(config: GeoMapObject, options: CustomRenderMethodInput) {
    const mercator = MercatorCoordinate.fromLngLat(
      [config.longitude, config.latitude],
      config.altitudeM,
    );
    const meterScale = mercator.meterInMercatorCoordinateUnits() * config.scale;
    const modelTransform = composeModelTransformMatrix({
      mercatorX: mercator.x,
      mercatorY: mercator.y,
      mercatorZ: mercator.z ?? 0,
      meterScale,
      rotationXDeg: config.pitchDeg,
      rotationYDeg: config.headingDeg,
      rotationZDeg: config.rollDeg,
    });
    return composeCameraProjectionMatrix(options.defaultProjectionData.mainMatrix, modelTransform);
  }

  private async ensureLoaded(id: string): Promise<void> {
    const managed = this.models.get(id);
    if (!managed || managed.object || managed.loading) {
      return;
    }
    managed.loading = true;
    try {
      const root = await loadPreparedGlbModel(managed.config.modelUrl);
      if (!this.models.has(id)) {
        disposeThreeObject(root);
        return;
      }
      this.scene.add(root);
      managed.object = root;
      managed.loading = false;
      this.map?.triggerRepaint();
    } catch {
      managed.loading = false;
    }
  }

  private disposeManaged(managed: ManagedModel): void {
    if (!managed.object) {
      return;
    }
    this.scene.remove(managed.object);
    disposeThreeObject(managed.object);
    managed.object = null;
  }

  private addLights(): void {
    this.scene.add(new AmbientLight(0xffffff, THREE_AMBIENT_LIGHT_INTENSITY));
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

const layersByMap = new WeakMap<MapLibreMap, ThreeBuildingLayer>();

export const getThreeBuildingLayer = (map: MapLibreMap): ThreeBuildingLayer | null => {
  const existing = layersByMap.get(map);
  if (existing && map.getLayer(THREE_BUILDING_LAYER_ID)) {
    return existing;
  }
  return null;
};

/** Ensure a single `ThreeBuildingLayer` is attached to the map. */
export const ensureThreeBuildingLayer = (map: MapLibreMap): ThreeBuildingLayer => {
  const existing = layersByMap.get(map);
  if (existing && map.getLayer(THREE_BUILDING_LAYER_ID)) {
    return existing;
  }
  if (map.getLayer(THREE_BUILDING_LAYER_ID)) {
    map.removeLayer(THREE_BUILDING_LAYER_ID);
  }
  const layer = new ThreeBuildingLayer();
  map.addLayer(layer);
  layersByMap.set(map, layer);
  return layer;
};

/** Remove the Three.js building layer if present. */
export const removeThreeBuildingLayer = (map: MapLibreMap): void => {
  if (map.getLayer(THREE_BUILDING_LAYER_ID)) {
    map.removeLayer(THREE_BUILDING_LAYER_ID);
  }
  layersByMap.delete(map);
};
