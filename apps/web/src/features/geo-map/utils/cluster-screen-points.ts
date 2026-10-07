import { MARKER_CLUSTER_ZOOM_STEP, MAX_MAP_ZOOM } from '@/features/geo-map/constants';

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

const CELL_OFFSETS = [-1, 0, 1] as const;

const cellKey = (x: number, y: number, cellSize: number): string =>
  `${Math.floor(x / cellSize)}:${Math.floor(y / cellSize)}`;

const screenDistance = (left: ClusterScreenPoint, right: ClusterScreenPoint): number =>
  Math.hypot(left.x - right.x, left.y - right.y);

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

const indexByCell = (
  points: readonly ClusterScreenPoint[],
  cellSize: number,
): Map<string, number[]> => {
  const cells = new Map<string, number[]>();
  for (const [index, point] of points.entries()) {
    const key = cellKey(point.x, point.y, cellSize);
    const bucket = cells.get(key);
    if (bucket) {
      bucket.push(index);
      continue;
    }
    cells.set(key, [index]);
  }
  return cells;
};

const neighborIndexes = (
  cells: ReadonlyMap<string, readonly number[]>,
  point: ClusterScreenPoint,
  cellSize: number,
): number[] => {
  const originX = Math.floor(point.x / cellSize);
  const originY = Math.floor(point.y / cellSize);
  const indexes: number[] = [];
  for (const offsetX of CELL_OFFSETS) {
    for (const offsetY of CELL_OFFSETS) {
      const bucket = cells.get(`${originX + offsetX}:${originY + offsetY}`);
      if (bucket) {
        indexes.push(...bucket);
      }
    }
  }
  return indexes;
};

const linkNearbyPoints = (
  points: readonly ClusterScreenPoint[],
  parent: number[],
  radiusPx: number,
): void => {
  const cells = indexByCell(points, radiusPx);
  for (const [index, point] of points.entries()) {
    for (const neighborIndex of neighborIndexes(cells, point, radiusPx)) {
      const neighbor = points[neighborIndex];
      const withinRadius = neighbor !== undefined && screenDistance(point, neighbor) <= radiusPx;
      if (neighborIndex > index && withinRadius) {
        union(parent, index, neighborIndex);
      }
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
 * Groups screen-projected pins that sit within `radiusPx` of each other,
 * including chains (A near B, B near C). Lone pins stay one-member clusters.
 * Cluster position is the mean of member coordinates; `apartmentCount` is the sum.
 */
export const clusterScreenPoints = <T extends ClusterScreenPoint>(
  points: readonly T[],
  radiusPx: number,
): MapMarkerCluster<T>[] => {
  if (points.length === 0) {
    return [];
  }
  const parent = points.map((_, index) => index);
  if (radiusPx > 0) {
    linkNearbyPoints(points, parent, radiusPx);
  }
  return buildClusters(points, parent);
};

/** Next camera zoom after activating a count bubble. */
export const resolveClusterExpandZoom = (currentZoom: number): number =>
  Math.min(MAX_MAP_ZOOM, currentZoom + MARKER_CLUSTER_ZOOM_STEP);

/**
 * A bubble is only for a real pile of apartments. Lone pins stay clickable,
 * and a pile with no published apartments stays as pins instead of a "0".
 */
export const shouldRenderClusterBubble = (memberCount: number, apartmentCount: number): boolean =>
  memberCount > 1 && apartmentCount > 0;
