export type LngLatTuple = [number, number];

export type RoadLine = {
  id: string;
  coords: LngLatTuple[];
  highway: string;
  lengthM: number;
};

export type Vehicle = {
  id: string;
  roadId: string;
  distanceM: number;
  speedMps: number;
  modelIndex: number;
  lng: number;
  lat: number;
  bearing: number;
};
