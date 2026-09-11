import { type CustomRenderMethodInput, MercatorCoordinate } from 'maplibre-gl';
import { InstancedMesh, type Camera, type Scene, type WebGLRenderer } from 'three';

import { advanceTraffic, mergeTrafficActors } from '@/features/geo-map/traffic/advance-traffic';
import { ROAD_TRAFFIC_MAX_VISIBLE } from '@/features/geo-map/traffic/constants';
import {
  createTrafficCarGeometry,
  createTrafficCarMaterial,
} from '@/features/geo-map/traffic/create-traffic-car';
import { trafficPosesFromActors } from '@/features/geo-map/traffic/traffic-poses';
import type { RoadPath, RoadTrafficState, TrafficActor } from '@/features/geo-map/traffic/types';
import { writeTrafficInstanceMatrices } from '@/features/geo-map/traffic/write-traffic-instances';
import { DEFAULT_MODEL_ROTATION_X_DEG } from '@/features/geo-map/three/constants';
import { disposeThreeObject } from '@/features/geo-map/three/dispose-three-object';
import {
  composeCameraProjectionMatrix,
  composeModelTransformMatrix,
} from '@/features/geo-map/three/model-transform-matrix';
import type { GreenLngLat, GreenSampleBounds } from '@/features/geo-map/trees/types';

const MAX_FRAME_DT_SEC = 0.05;

const createTrafficMesh = (): InstancedMesh => {
  const mesh = new InstancedMesh(
    createTrafficCarGeometry(),
    createTrafficCarMaterial(),
    ROAD_TRAFFIC_MAX_VISIBLE,
  );
  mesh.count = 0;
  mesh.frustumCulled = false;
  mesh.visible = false;
  return mesh;
};

const writeTrafficMesh = (
  mesh: InstancedMesh,
  state: RoadTrafficState,
  actors: readonly TrafficActor[],
  paths: ReadonlyMap<string, RoadPath>,
): void => {
  const poses = trafficPosesFromActors(actors, paths, state.clip).slice(
    0,
    ROAD_TRAFFIC_MAX_VISIBLE,
  );
  const mercator = MercatorCoordinate.fromLngLat(
    [state.origin.longitude, state.origin.latitude],
    0,
  );
  writeTrafficInstanceMatrices(
    poses,
    state.origin,
    mercator.meterInMercatorCoordinateUnits(),
    (index, matrix) => {
      mesh.setMatrixAt(index, matrix);
    },
  );
  mesh.count = poses.length;
  mesh.instanceMatrix.needsUpdate = true;
};

/** Viewport road cars on the shared building renderer. */
export class BuildingTrafficController {
  private mesh: InstancedMesh | null = null;
  private origin: GreenLngLat = { longitude: 0, latitude: 0 };
  private clip: GreenSampleBounds | null = null;
  private actors: TrafficActor[] = [];
  private paths = new Map<string, RoadPath>();
  private lastMs = 0;
  private pending: RoadTrafficState | null = null;

  setState(state: RoadTrafficState | null, scene: Scene | null): void {
    if (!state || state.actors.length === 0) {
      this.clear(scene);
      return;
    }
    if (!scene) {
      this.pending = state;
      return;
    }
    this.apply(state, scene);
  }

  flushPending(scene: Scene): void {
    if (!this.pending) {
      return;
    }
    this.apply(this.pending, scene);
    this.pending = null;
  }

  render(
    renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera,
    options: CustomRenderMethodInput,
  ): boolean {
    if (this.actors.length === 0 || !this.clip) {
      return false;
    }
    const now = performance.now();
    const dtSec = this.lastMs === 0 ? 0 : Math.min((now - this.lastMs) / 1000, MAX_FRAME_DT_SEC);
    this.lastMs = now;
    advanceTraffic(this.actors, this.paths, dtSec);
    if (!this.mesh) {
      this.mesh = createTrafficMesh();
      scene.add(this.mesh);
    }
    writeTrafficMesh(
      this.mesh,
      {
        actors: this.actors,
        paths: [...this.paths.values()],
        origin: this.origin,
        clip: this.clip,
      },
      this.actors,
      this.paths,
    );
    this.draw(renderer, scene, camera, options);
    return true;
  }

  dispose(scene: Scene): void {
    this.clear(scene);
  }

  private apply(state: RoadTrafficState, scene: Scene): void {
    this.origin = state.origin;
    this.clip = state.clip;
    this.paths = new Map(state.paths.map((path) => [path.id, path]));
    this.actors = mergeTrafficActors(this.actors, state.actors);
    this.lastMs = 0;
    if (!this.mesh) {
      this.mesh = createTrafficMesh();
      scene.add(this.mesh);
    }
    writeTrafficMesh(this.mesh, state, this.actors, this.paths);
  }

  private clear(scene: Scene | null): void {
    this.actors = [];
    this.paths.clear();
    this.clip = null;
    this.lastMs = 0;
    this.pending = null;
    if (!this.mesh) {
      return;
    }
    if (scene) {
      scene.remove(this.mesh);
    }
    disposeThreeObject(this.mesh);
    this.mesh = null;
  }

  private draw(
    renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera,
    options: CustomRenderMethodInput,
  ): void {
    if (!this.mesh || this.mesh.count === 0) {
      return;
    }
    const mercator = MercatorCoordinate.fromLngLat(
      [this.origin.longitude, this.origin.latitude],
      0,
    );
    camera.projectionMatrix.copy(
      composeCameraProjectionMatrix(
        options.defaultProjectionData.mainMatrix,
        composeModelTransformMatrix({
          mercatorX: mercator.x,
          mercatorY: mercator.y,
          mercatorZ: mercator.z ?? 0,
          meterScale: mercator.meterInMercatorCoordinateUnits(),
          rotationXDeg: DEFAULT_MODEL_ROTATION_X_DEG,
          rotationYDeg: 0,
          rotationZDeg: 0,
        }),
      ),
    );
    this.mesh.visible = true;
    renderer.resetState();
    renderer.render(scene, camera);
    this.mesh.visible = false;
  }
}
