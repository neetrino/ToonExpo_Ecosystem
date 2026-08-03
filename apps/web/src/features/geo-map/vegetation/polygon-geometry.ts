export type LngLat = [number, number];
export type MeterPoint = { x: number; y: number };

const METERS_PER_DEG_LAT = 110_540;
const METERS_PER_DEG_LNG_EQUATOR = 111_320;

export const lngLatToLocalMeters = (
  originLng: number,
  originLat: number,
  lng: number,
  lat: number,
): MeterPoint => {
  const cosLat = Math.cos((originLat * Math.PI) / 180);
  return {
    x: (lng - originLng) * METERS_PER_DEG_LNG_EQUATOR * cosLat,
    y: (lat - originLat) * METERS_PER_DEG_LAT,
  };
};

export const metersToLngLat = (point: MeterPoint, origin: LngLat): LngLat => {
  const cosLat = Math.cos((origin[1] * Math.PI) / 180);
  return [
    origin[0] + point.x / (METERS_PER_DEG_LNG_EQUATOR * cosLat),
    origin[1] + point.y / METERS_PER_DEG_LAT,
  ];
};

export const ringSame = (a: LngLat, b: LngLat): boolean =>
  Math.abs(a[0] - b[0]) < 1e-12 && Math.abs(a[1] - b[1]) < 1e-12;

export const ringCentroid = (ring: LngLat[]): LngLat => {
  let x = 0;
  let y = 0;
  const n = ring.length - (ringSame(ring[0]!, ring[ring.length - 1]!) ? 1 : 0);
  for (let i = 0; i < n; i++) {
    x += ring[i]![0];
    y += ring[i]![1];
  }
  return [x / Math.max(1, n), y / Math.max(1, n)];
};

export const ringToMeters = (ring: LngLat[], origin: LngLat): MeterPoint[] => {
  const closed = ringSame(ring[0]!, ring[ring.length - 1]!) ? ring.slice(0, -1) : ring;
  return closed.map((c) => lngLatToLocalMeters(origin[0], origin[1], c[0], c[1]));
};

export const polygonAreaM2 = (ring: LngLat[]): number => {
  if (ring.length < 3) {
    return 0;
  }
  const origin = ringCentroid(ring);
  const meters = ringToMeters(ring, origin);
  let sum = 0;
  for (let i = 0; i < meters.length; i++) {
    const a = meters[i]!;
    const b = meters[(i + 1) % meters.length]!;
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) * 0.5;
};

export const pointInRing = (point: MeterPoint, ring: MeterPoint[]): boolean => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]!.x;
    const yi = ring[i]!.y;
    const xj = ring[j]!.x;
    const yj = ring[j]!.y;
    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
};

export const bboxOf = (
  ring: MeterPoint[],
): { minX: number; minY: number; maxX: number; maxY: number } => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of ring) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  return { minX, minY, maxX, maxY };
};
