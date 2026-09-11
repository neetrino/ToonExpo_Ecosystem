import type { GreenLngLat, GreenSampleBounds } from '@/features/geo-map/trees/types';

export type RoadLine = readonly GreenLngLat[];

export type RoadPath = {
  id: string;
  points: RoadLine;
  lengthM: number;
};

export type TrafficActor = {
  id: string;
  pathId: string;
  distanceM: number;
  speedMps: number;
};

export type TrafficCarPose = {
  longitude: number;
  latitude: number;
  headingDeg: number;
};

export type RoadTrafficState = {
  actors: TrafficActor[];
  paths: RoadPath[];
  origin: GreenLngLat;
  clip: GreenSampleBounds;
};
