import type { RoadPath, TrafficActor } from '@/features/geo-map/traffic/types';

const wrapDistance = (distanceM: number, lengthM: number): number =>
  ((distanceM % lengthM) + lengthM) % lengthM;

/** Move cars along their road. Mutates `actors` in place. */
export const advanceTraffic = (
  actors: readonly TrafficActor[],
  paths: ReadonlyMap<string, RoadPath>,
  dtSec: number,
): void => {
  if (dtSec <= 0) {
    return;
  }
  for (const actor of actors) {
    const path = paths.get(actor.pathId);
    if (!path || path.lengthM <= 0) {
      continue;
    }
    actor.distanceM = wrapDistance(actor.distanceM + actor.speedMps * dtSec, path.lengthM);
  }
};

/** Keep a car's progress when the same slot is still in the new clip. */
export const mergeTrafficActors = (
  previous: readonly TrafficActor[],
  next: readonly TrafficActor[],
): TrafficActor[] => {
  const prev = new Map(previous.map((actor) => [actor.id, actor.distanceM]));
  return next.map((actor) => {
    const distanceM = prev.get(actor.id);
    return distanceM === undefined ? actor : { ...actor, distanceM };
  });
};
