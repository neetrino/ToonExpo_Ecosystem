export type GreenLngLat = {
  longitude: number;
  latitude: number;
};

export type LngLatRing = readonly (readonly [number, number])[];

export type GreenSampleBounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export type CanopyTreeInstance = {
  longitude: number;
  latitude: number;
  headingDeg: number;
  scale: number;
};
