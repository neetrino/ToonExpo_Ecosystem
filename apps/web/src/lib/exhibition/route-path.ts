import { VENUE_PATH_BOOTH_SNAP_EPSILON } from '@toonexpo/contracts';

export type RoutePoint = {
  xPercent: number;
  yPercent: number;
};

export type RouteGraphNode = {
  id: string;
  xPercent: number;
  yPercent: number;
  kind: 'ENTRANCE' | 'WAYPOINT' | 'BOOTH';
  boothId: string | null;
};

export type RouteGraphEdge = {
  fromNodeId: string;
  toNodeId: string;
};

export type RouteGraph = {
  nodes: RouteGraphNode[];
  edges: RouteGraphEdge[];
};

function distanceSq(a: RoutePoint, b: RoutePoint): number {
  const dx = a.xPercent - b.xPercent;
  const dy = a.yPercent - b.yPercent;
  return dx * dx + dy * dy;
}

function buildAdjacency(graph: RouteGraph): Map<string, string[]> {
  const adjacency = new Map<string, string[]>();
  for (const node of graph.nodes) {
    adjacency.set(node.id, []);
  }
  for (const edge of graph.edges) {
    const fromList = adjacency.get(edge.fromNodeId);
    const toList = adjacency.get(edge.toNodeId);
    if (!fromList || !toList) {
      continue;
    }
    fromList.push(edge.toNodeId);
    toList.push(edge.fromNodeId);
  }
  return adjacency;
}

/**
 * Equal-weight shortest path (BFS). Edges are bidirectional.
 * Returns percent points from start through destination, or null if unreachable.
 */
export function findRoutePath(
  graph: RouteGraph,
  startNodeId: string,
  endNodeId: string,
): RoutePoint[] | null {
  if (startNodeId === endNodeId) {
    const node = graph.nodes.find((row) => row.id === startNodeId);
    return node ? [{ xPercent: node.xPercent, yPercent: node.yPercent }] : null;
  }

  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  if (!byId.has(startNodeId) || !byId.has(endNodeId)) {
    return null;
  }

  const adjacency = buildAdjacency(graph);
  const previous = new Map<string, string | null>();
  const queue: string[] = [startNodeId];
  previous.set(startNodeId, null);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    if (current === endNodeId) {
      break;
    }
    for (const neighbor of adjacency.get(current) ?? []) {
      if (previous.has(neighbor)) {
        continue;
      }
      previous.set(neighbor, current);
      queue.push(neighbor);
    }
  }

  if (!previous.has(endNodeId)) {
    return null;
  }

  const ids: string[] = [];
  let cursor: string | null = endNodeId;
  while (cursor) {
    ids.push(cursor);
    cursor = previous.get(cursor) ?? null;
  }
  ids.reverse();

  return ids.map((id) => {
    const node = byId.get(id);
    return { xPercent: node?.xPercent ?? 0, yPercent: node?.yPercent ?? 0 };
  });
}

/** Prefer explicit BOOTH node with boothId; else nearest node within epsilon. */
export function resolveBoothDestinationNodeId(
  booth: RoutePoint & { id: string },
  nodes: RouteGraphNode[],
  epsilon: number = VENUE_PATH_BOOTH_SNAP_EPSILON,
): string | null {
  const linked = nodes.find((node) => node.kind === 'BOOTH' && node.boothId === booth.id);
  if (linked) {
    return linked.id;
  }

  const epsilonSq = epsilon * epsilon;
  let bestId: string | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const node of nodes) {
    const dist = distanceSq(booth, node);
    if (dist <= epsilonSq && dist < bestDist) {
      bestDist = dist;
      bestId = node.id;
    }
  }
  return bestId;
}

export function resolveEntranceNodeId(
  nodes: RouteGraphNode[],
  entrance: RoutePoint | null,
): string | null {
  const entranceNode = nodes.find((node) => node.kind === 'ENTRANCE');
  if (entranceNode) {
    return entranceNode.id;
  }
  if (!entrance) {
    return null;
  }
  return resolveBoothDestinationNodeId({ id: '__entrance__', ...entrance }, nodes);
}

export function computeBoothRoute(
  graph: RouteGraph,
  booth: RoutePoint & { id: string },
  entrance: RoutePoint | null,
): RoutePoint[] | null {
  const startId = resolveEntranceNodeId(graph.nodes, entrance);
  const endId = resolveBoothDestinationNodeId(booth, graph.nodes);
  if (!startId || !endId) {
    return null;
  }
  return findRoutePath(graph, startId, endId);
}
