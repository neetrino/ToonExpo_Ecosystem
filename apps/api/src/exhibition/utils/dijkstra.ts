export type GraphNode = {
  id: string;
  x: number;
  y: number;
};

export type GraphEdge = {
  fromId: string;
  toId: string;
  weight: number;
};

export type DijkstraResult =
  | { reachable: true; path: string[]; totalWeight: number }
  | { reachable: false };

/**
 * Computes shortest path with non-negative edge weights (bidirectional graph).
 */
export const dijkstraShortestPath = (
  nodes: GraphNode[],
  edges: GraphEdge[],
  startId: string,
  endId: string,
): DijkstraResult => {
  if (startId === endId) {
    return { reachable: true, path: [startId], totalWeight: 0 };
  }

  const nodeIds = new Set(nodes.map((node) => node.id));
  if (!nodeIds.has(startId) || !nodeIds.has(endId)) {
    return { reachable: false };
  }

  const adjacency = buildAdjacency(edges);
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set(nodeIds);

  for (const id of nodeIds) {
    distances.set(id, id === startId ? 0 : Number.POSITIVE_INFINITY);
    previous.set(id, null);
  }

  while (unvisited.size > 0) {
    const current = pickMinDistanceNode(unvisited, distances);
    if (current == null) {
      break;
    }

    unvisited.delete(current);

    if (current === endId) {
      break;
    }

    const currentDistance = distances.get(current) ?? Number.POSITIVE_INFINITY;
    if (!Number.isFinite(currentDistance)) {
      break;
    }

    relaxNeighbors(current, currentDistance, adjacency, distances, previous);
  }

  const endDistance = distances.get(endId) ?? Number.POSITIVE_INFINITY;
  if (!Number.isFinite(endDistance)) {
    return { reachable: false };
  }

  return {
    reachable: true,
    path: reconstructPath(previous, endId),
    totalWeight: endDistance,
  };
};

const buildAdjacency = (
  edges: GraphEdge[],
): Map<string, { toId: string; weight: number }[]> => {
  const adjacency = new Map<string, { toId: string; weight: number }[]>();

  for (const edge of edges) {
    appendEdge(adjacency, edge.fromId, edge.toId, edge.weight);
    appendEdge(adjacency, edge.toId, edge.fromId, edge.weight);
  }

  return adjacency;
};

const appendEdge = (
  adjacency: Map<string, { toId: string; weight: number }[]>,
  fromId: string,
  toId: string,
  weight: number,
): void => {
  const list = adjacency.get(fromId) ?? [];
  list.push({ toId, weight });
  adjacency.set(fromId, list);
};

const pickMinDistanceNode = (
  unvisited: Set<string>,
  distances: Map<string, number>,
): string | null => {
  let bestId: string | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const id of unvisited) {
    const distance = distances.get(id) ?? Number.POSITIVE_INFINITY;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestId = id;
    }
  }

  return bestId;
};

const relaxNeighbors = (
  current: string,
  currentDistance: number,
  adjacency: Map<string, { toId: string; weight: number }[]>,
  distances: Map<string, number>,
  previous: Map<string, string | null>,
): void => {
  const neighbors = adjacency.get(current) ?? [];

  for (const neighbor of neighbors) {
    const alt = currentDistance + neighbor.weight;
    const known = distances.get(neighbor.toId) ?? Number.POSITIVE_INFINITY;

    if (alt < known) {
      distances.set(neighbor.toId, alt);
      previous.set(neighbor.toId, current);
    }
  }
};

const reconstructPath = (
  previous: Map<string, string | null>,
  endId: string,
): string[] => {
  const path: string[] = [];
  let cursor: string | null = endId;

  while (cursor != null) {
    path.unshift(cursor);
    cursor = previous.get(cursor) ?? null;
  }

  return path;
};

/**
 * Euclidean distance between two percent-coordinate nodes.
 */
export const euclideanDistance = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number => {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
};
