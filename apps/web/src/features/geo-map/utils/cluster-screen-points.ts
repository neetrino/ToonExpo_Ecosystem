import {
  MARKER_CLUSTER_DENSE_MIN_COUNT,
  MARKER_CLUSTER_GREEN_MIN_COUNT,
  MARKER_CLUSTER_MAX_DISTANCE_METERS,
  MARKER_CLUSTER_ZOOM_STEP,
  MAX_MAP_ZOOM,
} from '@/features/geo-map/constants';

const EARTH_RADIUS_METERS = 6_371_000;

/** A map pin already projected into screen pixels. */
export type ClusterScreenPoint = {
  id: string;
  longitude: number;
  latitude: number;
  apartmentCount: number;
  x: number;
  y: number;
};

/** One bubble (or a lone pin) after screen-space clustering. */
export type MapMarkerCluster<T extends ClusterScreenPoint> = {
  /** Stable id: member ids sorted and joined. A lone pin keeps its own id. */
  id: string;
  longitude: number;
  latitude: number;
  apartmentCount: number;
  members: readonly T[];
};

const screenDistance = (left: ClusterScreenPoint, right: ClusterScreenPoint): number =>
  Math.hypot(left.x - right.x, left.y - right.y);

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/** Ground distance so a cluster cannot swallow a whole city when zoomed out. */
const geographicDistanceMeters = (left: ClusterScreenPoint, right: ClusterScreenPoint): number => {
  const latitudeDelta = toRadians(right.latitude - left.latitude);
  const longitudeDelta = toRadians(right.longitude - left.longitude);
  const leftLat = toRadians(left.latitude);
  const rightLat = toRadians(right.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(leftLat) * Math.cos(rightLat) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(haversine)));
};

const findRoot = (parent: readonly number[], index: number): number => {
  let cursor = index;
  while (parent[cursor] !== cursor) {
    const next = parent[cursor];
    if (next === undefined) {
      return cursor;
    }
    cursor = next;
  }
  return cursor;
};

const union = (parent: number[], left: number, right: number): void => {
  const leftRoot = findRoot(parent, left);
  const rightRoot = findRoot(parent, right);
  if (leftRoot !== rightRoot) {
    parent[rightRoot] = leftRoot;
  }
};

type IndexPair = {
  distanceMeters: number;
  left: number;
  right: number;
};

const pointAt = (
  points: readonly ClusterScreenPoint[],
  index: number,
): ClusterScreenPoint | undefined => points[index];

const pairDistanceMeters = (
  points: readonly ClusterScreenPoint[],
  left: number,
  right: number,
): number => {
  const leftPoint = pointAt(points, left);
  const rightPoint = pointAt(points, right);
  if (!leftPoint || !rightPoint) {
    return Number.POSITIVE_INFINITY;
  }
  return geographicDistanceMeters(leftPoint, rightPoint);
};

const neighborhoodPairs = (points: readonly ClusterScreenPoint[]): IndexPair[] => {
  const pairs: IndexPair[] = [];
  for (let left = 0; left < points.length; left += 1) {
    for (let right = left + 1; right < points.length; right += 1) {
      pairs.push({ distanceMeters: pairDistanceMeters(points, left, right), left, right });
    }
  }
  return pairs.sort((left, right) => left.distanceMeters - right.distanceMeters);
};

const widestSpanMeters = (
  points: readonly ClusterScreenPoint[],
  indexes: readonly number[],
): number => {
  let widest = 0;
  for (let left = 0; left < indexes.length; left += 1) {
    for (let right = left + 1; right < indexes.length; right += 1) {
      const leftIndex = indexes[left];
      const rightIndex = indexes[right];
      if (leftIndex === undefined || rightIndex === undefined) {
        continue;
      }
      widest = Math.max(widest, pairDistanceMeters(points, leftIndex, rightIndex));
    }
  }
  return widest;
};

const membersOfRoots = (
  parent: readonly number[],
  leftRoot: number,
  rightRoot: number,
): number[] => {
  const members: number[] = [];
  for (let index = 0; index < parent.length; index += 1) {
    const root = findRoot(parent, index);
    if (root === leftRoot || root === rightRoot) {
      members.push(index);
    }
  }
  return members;
};

const withinScreenRadius = (
  points: readonly ClusterScreenPoint[],
  left: number,
  right: number,
  radiusPx: number,
): boolean => {
  const leftPoint = pointAt(points, left);
  const rightPoint = pointAt(points, right);
  if (!leftPoint || !rightPoint) {
    return false;
  }
  return screenDistance(leftPoint, rightPoint) <= radiusPx;
};

/**
 * Joins a pair only when the whole resulting group still fits in one district.
 * A chain of close links cannot swallow the next district.
 */
const linkNeighborhoods = (
  points: readonly ClusterScreenPoint[],
  parent: number[],
  radiusPx: number,
  maxDistanceMeters: number,
): void => {
  for (const pair of neighborhoodPairs(points)) {
    if (pair.distanceMeters > maxDistanceMeters) {
      return;
    }
    if (!withinScreenRadius(points, pair.left, pair.right, radiusPx)) {
      continue;
    }
    const leftRoot = findRoot(parent, pair.left);
    const rightRoot = findRoot(parent, pair.right);
    if (leftRoot === rightRoot) {
      continue;
    }
    const members = membersOfRoots(parent, leftRoot, rightRoot);
    if (widestSpanMeters(points, members) <= maxDistanceMeters) {
      union(parent, leftRoot, rightRoot);
    }
  }
};

const toCluster = <T extends ClusterScreenPoint>(members: readonly T[]): MapMarkerCluster<T> => {
  const sorted = [...members].sort((left, right) => left.id.localeCompare(right.id));
  const count = sorted.length;
  const longitude = sorted.reduce((sum, member) => sum + member.longitude, 0) / count;
  const latitude = sorted.reduce((sum, member) => sum + member.latitude, 0) / count;
  const apartmentCount = sorted.reduce((sum, member) => sum + member.apartmentCount, 0);
  return {
    id: sorted.map((member) => member.id).join('|'),
    longitude,
    latitude,
    apartmentCount,
    members: sorted,
  };
};

const buildClusters = <T extends ClusterScreenPoint>(
  points: readonly T[],
  parent: number[],
): MapMarkerCluster<T>[] => {
  const groups = new Map<number, T[]>();
  for (const [index, point] of points.entries()) {
    const root = findRoot(parent, index);
    const group = groups.get(root);
    if (group) {
      group.push(point);
      continue;
    }
    groups.set(root, [point]);
  }
  return [...groups.values()]
    .map((members) => toCluster(members))
    .sort((left, right) => left.id.localeCompare(right.id));
};

/**
 * Groups pins that sit in one district: close enough on screen to belong to
 * the same overview, and no wider on the ground than `maxDistanceMeters`.
 * Lone pins stay one-member clusters. Position is the mean of member
 * coordinates; `apartmentCount` is the sum.
 */
export const clusterScreenPoints = <T extends ClusterScreenPoint>(
  points: readonly T[],
  radiusPx: number,
  maxDistanceMeters: number = MARKER_CLUSTER_MAX_DISTANCE_METERS,
): MapMarkerCluster<T>[] => {
  if (points.length === 0) {
    return [];
  }
  const parent = points.map((_, index) => index);
  if (radiusPx > 0) {
    linkNeighborhoods(points, parent, radiusPx, maxDistanceMeters);
  }
  return buildClusters(points, parent);
};

/** Next camera zoom after activating a count bubble. */
export const resolveClusterExpandZoom = (currentZoom: number): number =>
  Math.min(MAX_MAP_ZOOM, currentZoom + MARKER_CLUSTER_ZOOM_STEP);

/**
 * A bubble shows the published-apartment count for a district, including a
 * single project. A placement with no published apartments stays a pin.
 */
export const shouldRenderClusterBubble = (memberCount: number, apartmentCount: number): boolean =>
  memberCount > 0 && apartmentCount > 0;

/** Fill of a count bubble: copper below 50, green from 50, copper again from 100. */
export type ClusterBubbleTone = 'copper' | 'green';

export const resolveClusterBubbleTone = (apartmentCount: number): ClusterBubbleTone => {
  const inGreenBand =
    apartmentCount >= MARKER_CLUSTER_GREEN_MIN_COUNT &&
    apartmentCount < MARKER_CLUSTER_DENSE_MIN_COUNT;
  return inGreenBand ? 'green' : 'copper';
};
