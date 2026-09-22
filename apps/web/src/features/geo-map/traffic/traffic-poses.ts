import { isLngLatInBounds } from '@/features/geo-map/traffic/is-lnglat-in-bounds';
import { poseAlongPath } from '@/features/geo-map/traffic/path-pose';
import type { RoadPath, TrafficActor, TrafficCarPose } from '@/features/geo-map/traffic/types';
import type { GreenSampleBounds } from '@/features/geo-map/trees/types';

const REVERSE_HEADING_DEG = 180;

/** Poses for cars that are still on the visible clip of their road. */
export const trafficPosesFromActors = (
  actors: readonly TrafficActor[],
  paths: ReadonlyMap<string, RoadPath>,
  clip: GreenSampleBounds,
): TrafficCarPose[] => {
  const poses: TrafficCarPose[] = [];
  for (const actor of actors) {
    const path = paths.get(actor.pathId);
    if (!path) {
      continue;
    }
    const pose = poseAlongPath(path.points, actor.distanceM);
    if (!pose || !isLngLatInBounds(pose, clip)) {
      continue;
    }
    poses.push({
      longitude: pose.longitude,
      latitude: pose.latitude,
      headingDeg: pose.headingDeg + (actor.speedMps < 0 ? REVERSE_HEADING_DEG : 0),
    });
  }
  return poses;
};
