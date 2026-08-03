/**
 * Pure geographic helpers for circular model footprint polygons.
 * Used to mask OSM `building-3d` extrusions under published GLB models.
 */

/** Mean Earth radius (WGS84 spherical approximation) in meters. */
export const EARTH_RADIUS_METERS = 6_371_008.8;

const DEGREES_PER_RADIAN = 180 / Math.PI;

export type LngLatRing = readonly [number, number][];

/**
 * Offset a lng/lat by `eastMeters` / `northMeters` using an equirectangular
 * approximation (accurate enough for small radii, tens of meters).
 */
export const offsetLngLatMeters = (
  longitude: number,
  latitude: number,
  eastMeters: number,
  northMeters: number,
): { longitude: number; latitude: number } => {
  const latitudeRadians = (latitude * Math.PI) / 180;
  const metersPerDegreeLat = (EARTH_RADIUS_METERS * Math.PI) / 180;
  const metersPerDegreeLng = metersPerDegreeLat * Math.cos(latitudeRadians);
  return {
    longitude: longitude + eastMeters / metersPerDegreeLng,
    latitude: latitude + northMeters / metersPerDegreeLat,
  };
};

/**
 * Approximates a circle as a closed GeoJSON polygon ring (N-gon).
 * Ring is closed (first point repeated as last) per GeoJSON Polygon rules.
 */
export const buildCirclePolygonRing = (
  longitude: number,
  latitude: number,
  radiusMeters: number,
  segmentCount: number,
): LngLatRing => {
  if (segmentCount < 3) {
    throw new Error('segmentCount must be at least 3');
  }
  if (radiusMeters <= 0) {
    throw new Error('radiusMeters must be positive');
  }

  const ring: [number, number][] = [];
  for (let index = 0; index < segmentCount; index += 1) {
    const angleRadians = (2 * Math.PI * index) / segmentCount;
    const eastMeters = radiusMeters * Math.cos(angleRadians);
    const northMeters = radiusMeters * Math.sin(angleRadians);
    const point = offsetLngLatMeters(longitude, latitude, eastMeters, northMeters);
    ring.push([point.longitude, point.latitude]);
  }
  const first = ring[0];
  if (!first) {
    throw new Error('circle ring is empty');
  }
  ring.push([first[0], first[1]]);
  return ring;
};

/** Degrees of latitude for a given north/south meter distance (for tests). */
export const metersToLatitudeDegrees = (meters: number): number =>
  (meters / EARTH_RADIUS_METERS) * DEGREES_PER_RADIAN;
