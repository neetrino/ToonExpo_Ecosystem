import { Injectable } from "@nestjs/common";

import { ROUTE_GRAPH_CACHE_TTL_MS } from "../exhibition.constants.js";

export type CachedRouteNode = {
  id: string;
  label: string | null;
  type: string;
  xPercent: { toString(): string };
  yPercent: { toString(): string };
};

export type CachedRouteEdge = {
  fromNodeId: string;
  toNodeId: string;
  weight: { toString(): string } | null;
};

type CacheEntry = {
  loadedAtMs: number;
  nodes: CachedRouteNode[];
  edges: CachedRouteEdge[];
};

/**
 * Per-instance in-memory cache of venue route graphs (nodes + edges).
 * Invalidates implicitly via TTL; no cross-instance coordination.
 */
@Injectable()
export class RouteGraphCache {
  private readonly entries = new Map<string, CacheEntry>();

  get(
    venueMapId: string,
  ): { nodes: CachedRouteNode[]; edges: CachedRouteEdge[] } | null {
    const entry = this.entries.get(venueMapId);
    if (!entry) {
      return null;
    }
    if (Date.now() - entry.loadedAtMs > ROUTE_GRAPH_CACHE_TTL_MS) {
      this.entries.delete(venueMapId);
      return null;
    }
    return { nodes: entry.nodes, edges: entry.edges };
  }

  set(
    venueMapId: string,
    nodes: CachedRouteNode[],
    edges: CachedRouteEdge[],
  ): void {
    this.entries.set(venueMapId, {
      loadedAtMs: Date.now(),
      nodes,
      edges,
    });
  }

  /** Test helper: clear all entries. */
  clear(): void {
    this.entries.clear();
  }
}
