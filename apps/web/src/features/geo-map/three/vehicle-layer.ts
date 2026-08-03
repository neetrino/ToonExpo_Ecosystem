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
  type Group,
} from 'three';

import { cloneCarModel, preloadCarTemplates } from '@/features/geo-map/traffic/load-car-models';
import { VEHICLE_LAYER_ID } from '@/features/geo-map/traffic/traffic-config';
import type { Vehicle } from '@/features/geo-map/traffic/types';
import { lngLatToLocalMeters } from '@/features/geo-map/vegetation/polygon-geometry';

type CarMesh = {
  root: Group;
  modelIndex: number;
};

/**
 * Sparse Three.js car fleet as a MapLibre custom layer (separate from buildings).
 */
export class VehicleLayer implements CustomLayerInterface {
  readonly id = VEHICLE_LAYER_ID;
  readonly type = 'custom' as const;
  readonly renderingMode = '3d' as const;

  private map: MapLibreMap | null = null;
  private renderer: WebGLRenderer | null = null;
  private scene = new Scene();
  private camera = new Camera();
  private fleet: Vehicle[] = [];
  private meshes = new Map<string, CarMesh>();
  private enabled = true;
  private contextLost = false;
  private templatesReady = false;
  private pendingVehicles: Vehicle[] | null = null;
  private sceneOrigin = { lng: 0, lat: 0 };
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

    void preloadCarTemplates()
      .then(() => {
        this.templatesReady = true;
        if (this.pendingVehicles) {
          this.applyFleet(this.pendingVehicles);
          this.pendingVehicles = null;
        }
        this.map?.triggerRepaint();
      })
      .catch(() => {
        /* car GLBs failed — traffic stays empty */
      });
  }

  onRemove(): void {
    this.map?.getCanvas().removeEventListener('webglcontextlost', this.onContextLost);
    this.map?.getCanvas().removeEventListener('webglcontextrestored', this.onContextRestored);
    this.clearAllMeshes();
    this.scene.clear();
    this.renderer?.dispose();
    this.renderer = null;
    this.map = null;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    for (const mesh of this.meshes.values()) {
      mesh.root.visible = enabled;
    }
    this.map?.triggerRepaint();
  }

  setVehicles(vehicles: Vehicle[]): void {
    if (!this.templatesReady) {
      this.pendingVehicles = vehicles;
      return;
    }
    this.applyFleet(vehicles);
    this.map?.triggerRepaint();
  }

  syncPoses(): void {
    this.syncAllPoses();
  }

  render(_gl: WebGLRenderingContext | WebGL2RenderingContext, args: CustomRenderMethodInput): void {
    if (!this.renderer || !this.map || this.contextLost || !this.enabled) {
      return;
    }
    if (this.meshes.size === 0) {
      return;
    }
    this.syncAllPoses();
    this.setCenterProjection(args);
    this.renderer.resetState();
    this.renderer.render(this.scene, this.camera);
  }

  private applyFleet(vehicles: Vehicle[]): void {
    this.fleet = vehicles;
    if (vehicles.length === 0) {
      this.clearAllMeshes();
      return;
    }

    const nextIds = new Set(vehicles.map((v) => v.id));
    for (const [id, mesh] of this.meshes) {
      if (!nextIds.has(id)) {
        this.scene.remove(mesh.root);
        this.meshes.delete(id);
      }
    }

    for (const vehicle of vehicles) {
      if (this.meshes.has(vehicle.id)) {
        continue;
      }
      const root = cloneCarModel(vehicle.modelIndex);
      if (!root) {
        continue;
      }
      root.visible = this.enabled;
      this.scene.add(root);
      this.meshes.set(vehicle.id, { root, modelIndex: vehicle.modelIndex });
    }
    this.syncAllPoses();
  }

  private syncAllPoses(): void {
    if (!this.map) {
      return;
    }
    const center = this.map.getCenter();
    this.sceneOrigin = { lng: center.lng, lat: center.lat };
    const byId = new Map(this.fleet.map((v) => [v.id, v]));
    for (const [id, mesh] of this.meshes) {
      const vehicle = byId.get(id);
      if (!vehicle) {
        mesh.root.visible = false;
        continue;
      }
      this.placeInSceneMeters(mesh.root, vehicle);
      mesh.root.visible = this.enabled;
    }
  }

  private placeInSceneMeters(root: Group, vehicle: Vehicle): void {
    const { x: east, y: north } = lngLatToLocalMeters(
      this.sceneOrigin.lng,
      this.sceneOrigin.lat,
      vehicle.lng,
      vehicle.lat,
    );
    root.position.set(east, 0.05, -north);
    const bearingRad = (vehicle.bearing * Math.PI) / 180;
    root.rotation.set(0, -bearingRad + Math.PI, 0);
  }

  private setCenterProjection(args: CustomRenderMethodInput): void {
    const mercator = MercatorCoordinate.fromLngLat([this.sceneOrigin.lng, this.sceneOrigin.lat], 0);
    const scale = mercator.meterInMercatorCoordinateUnits();
    this.tmpModel
      .makeTranslation(mercator.x, mercator.y, mercator.z ?? 0)
      .scale(new Vector3(scale, -scale, scale));
    this.tmpMain.fromArray(args.defaultProjectionData.mainMatrix);
    this.camera.projectionMatrix.copy(this.tmpMain.multiply(this.tmpModel));
  }

  private clearAllMeshes(): void {
    for (const mesh of this.meshes.values()) {
      this.scene.remove(mesh.root);
    }
    this.meshes.clear();
    this.fleet = [];
  }

  private addLights(): void {
    const key = new DirectionalLight(0xffffff, 1.3);
    key.position.set(40, 80, 30);
    const fill = new DirectionalLight(0xffffff, 0.55);
    fill.position.set(-30, 40, -20);
    this.scene.add(key, fill, new AmbientLight(0xffffff, 0.65));
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

const layersByMap = new WeakMap<MapLibreMap, VehicleLayer>();

export const ensureVehicleLayer = (map: MapLibreMap): VehicleLayer => {
  const existing = layersByMap.get(map);
  if (existing && map.getLayer(VEHICLE_LAYER_ID)) {
    return existing;
  }
  if (map.getLayer(VEHICLE_LAYER_ID)) {
    map.removeLayer(VEHICLE_LAYER_ID);
  }
  const layer = new VehicleLayer();
  map.addLayer(layer);
  layersByMap.set(map, layer);
  return layer;
};

export const removeVehicleLayer = (map: MapLibreMap): void => {
  if (map.getLayer(VEHICLE_LAYER_ID)) {
    map.removeLayer(VEHICLE_LAYER_ID);
  }
  layersByMap.delete(map);
};
