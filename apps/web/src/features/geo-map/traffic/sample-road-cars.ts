import {
  ROAD_TRAFFIC_MAX_VISIBLE,
  ROAD_TRAFFIC_MIN_PATH_M,
  ROAD_TRAFFIC_SPACING_M,
  ROAD_TRAFFIC_SPEED_MIN_MPS,
  ROAD_TRAFFIC_SPEED_SPAN_MPS,
} from '@/features/geo-map/traffic/constants';
import { isLngLatInBounds } from '@/features/geo-map/traffic/is-lnglat-in-bounds';
import { pathLengthM, poseAlongPath, roadLineKey } from '@/features/geo-map/traffic/path-pose';
import type { RoadLine, RoadPath, TrafficActor } from '@/features/geo-map/traffic/types';
import { greenHashUnit } from '@/features/geo-map/trees/green-hash';
import type { GreenSampleBounds } from '@/features/geo-map/trees/types';

const SPEED_OFFSET_M = 8;

const spawnActorsOnPath = (
  path: RoadPath,
  clip: GreenSampleBounds,
  spacingM: number,
  actors: TrafficActor[],
  maxCars: number,
): void => {
  const offset = SPEED_OFFSET_M + greenHashUnit(`${path.id}:off`) * spacingM;
  const direction = greenHashUnit(`${path.id}:dir`) >= 0.5 ? 1 : -1;
  const speedMps =
    (ROAD_TRAFFIC_SPEED_MIN_MPS + greenHashUnit(`${path.id}:spd`) * ROAD_TRAFFIC_SPEED_SPAN_MPS) *
    direction;
  let slot = 0;
  for (let distanceM = offset; distanceM < path.lengthM; distanceM += spacingM) {
    if (actors.length >= maxCars) {
      return;
    }
    const pose = poseAlongPath(path.points, distanceM);
    const currentSlot = slot;
    slot += 1;
    if (!pose || !isLngLatInBounds(pose, clip)) {
      continue;
    }
    actors.push({
      id: `${path.id}:${currentSlot}`,
      pathId: path.id,
      distanceM,
      speedMps,
    });
  }
};

/**
 * Sparse, world-stable cars on visible road centerlines.
 * Zoom only changes which clip is sampled — the same slot stays the same car.
 */
export const sampleRoadCars = (
  lines: readonly RoadLine[],
  clip: GreenSampleBounds,
  spacingM: number = ROAD_TRAFFIC_SPACING_M,
  maxCars: number = ROAD_TRAFFIC_MAX_VISIBLE,
): { paths: RoadPath[]; actors: TrafficActor[] } => {
  const step = Math.max(spacingM, ROAD_TRAFFIC_MIN_PATH_M);
  const actors: TrafficActor[] = [];
  const paths: RoadPath[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    if (actors.length >= maxCars) {
      break;
    }
    const id = roadLineKey(line);
    if (!id || seen.has(id)) {
      continue;
    }
    const lengthM = pathLengthM(line);
    if (lengthM < ROAD_TRAFFIC_MIN_PATH_M) {
      continue;
    }
    seen.add(id);
    const path = { id, points: line, lengthM };
    const before = actors.length;
    spawnActorsOnPath(path, clip, step, actors, maxCars);
    if (actors.length > before) {
      paths.push(path);
    }
  }
  return { paths, actors };
};
