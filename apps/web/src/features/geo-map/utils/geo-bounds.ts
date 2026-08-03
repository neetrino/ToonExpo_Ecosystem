/** Pure geographic bounds helpers used for viewport-based model/marker visibility. */

export type LngLatBounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};

/**
 * Whether `[longitude, latitude]` falls within `bounds`, expanded by `paddingDegrees`
 * on every side (so points just outside the visible viewport still count as visible).
 */
export const isCoordinateWithinBounds = (
  longitude: number,
  latitude: number,
  bounds: LngLatBounds,
  paddingDegrees: number,
): boolean =>
  longitude >= bounds.west - paddingDegrees &&
  longitude <= bounds.east + paddingDegrees &&
  latitude >= bounds.south - paddingDegrees &&
  latitude <= bounds.north + paddingDegrees;
