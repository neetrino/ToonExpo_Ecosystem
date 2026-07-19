import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  PublicEntranceNodeListResponse,
  RoutePathResponse,
} from "@toonexpo/contracts";
import {
  EventStatus,
  PublicationStatus,
} from "@toonexpo/db";

import { AnalyticsService } from "../../analytics/analytics.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { EUCLIDEAN_WEIGHT_SCALE } from "../exhibition.constants.js";
import {
  dijkstraShortestPath,
  euclideanDistance,
  type GraphEdge,
  type GraphNode,
} from "../utils/dijkstra.js";
import {
  type CachedRouteEdge,
  type CachedRouteNode,
  RouteGraphCache,
} from "./route-graph.cache.js";

@Injectable()
export class PublicRouteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
    private readonly routeGraphCache: RouteGraphCache,
  ) {}

  async listEntranceNodes(mapId: string): Promise<PublicEntranceNodeListResponse> {
    await this.requirePublishedMap(mapId);

    const nodes = await this.prisma.db.routeNode.findMany({
      where: { venueMapId: mapId, type: "entrance" },
      orderBy: [{ label: "asc" }, { code: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        code: true,
        label: true,
        xPercent: true,
        yPercent: true,
      },
    });

    return {
      data: nodes.map((node) => ({
        id: node.id,
        code: node.code,
        label: node.label,
        xPercent: node.xPercent.toString(),
        yPercent: node.yPercent.toString(),
      })),
    };
  }

  async computeRoute(
    mapId: string,
    fromNodeId: string,
    toBoothId: string,
  ): Promise<RoutePathResponse> {
    await this.requirePublishedMap(mapId);

    const booth = await this.prisma.db.booth.findFirst({
      where: {
        id: toBoothId,
        venueMapId: mapId,
        publicationStatus: PublicationStatus.published,
      },
      select: { id: true },
    });

    if (!booth) {
      throw new NotFoundException("Published booth not found");
    }

    this.analytics.track({
      eventType: "route_requested",
      boothId: toBoothId,
    });

    const destinationNode = await this.prisma.db.routeNode.findFirst({
      where: { venueMapId: mapId, boothId: toBoothId },
      orderBy: [{ createdAt: "asc" }],
    });

    if (!destinationNode) {
      return { routeAvailable: false, nodes: [] };
    }

    const { nodes, edges } = await this.loadGraph(mapId);

    if (nodes.length === 0 || edges.length === 0) {
      return { routeAvailable: false, nodes: [] };
    }

    const graphNodes: GraphNode[] = nodes.map((node) => ({
      id: node.id,
      x: Number(node.xPercent),
      y: Number(node.yPercent),
    }));

    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const graphEdges: GraphEdge[] = edges.map((edge) => ({
      fromId: edge.fromNodeId,
      toId: edge.toNodeId,
      weight: resolveEdgeWeight(edge, nodeById),
    }));

    const result = dijkstraShortestPath(
      graphNodes,
      graphEdges,
      fromNodeId,
      destinationNode.id,
    );

    if (!result.reachable) {
      return { routeAvailable: false, nodes: [] };
    }

    const pathNodes = result.path
      .map((id) => nodeById.get(id))
      .filter((node): node is CachedRouteNode => node != null)
      .map((node) => ({
        id: node.id,
        xPercent: node.xPercent.toString(),
        yPercent: node.yPercent.toString(),
        label: node.label,
        type: node.type as RoutePathResponse["nodes"][number]["type"],
      }));

    return { routeAvailable: true, nodes: pathNodes };
  }

  private async loadGraph(
    mapId: string,
  ): Promise<{ nodes: CachedRouteNode[]; edges: CachedRouteEdge[] }> {
    const cached = this.routeGraphCache.get(mapId);
    if (cached) {
      return cached;
    }

    const [nodes, edges] = await Promise.all([
      this.prisma.db.routeNode.findMany({ where: { venueMapId: mapId } }),
      this.prisma.db.routeEdge.findMany({ where: { venueMapId: mapId } }),
    ]);

    this.routeGraphCache.set(mapId, nodes, edges);
    return { nodes, edges };
  }

  private async requirePublishedMap(mapId: string): Promise<void> {
    const map = await this.prisma.db.venueMap.findFirst({
      where: {
        id: mapId,
        publicationStatus: PublicationStatus.published,
        event: {
          status: EventStatus.active,
          publicationStatus: PublicationStatus.published,
        },
      },
      select: { id: true },
    });

    if (!map) {
      throw new NotFoundException("Published venue map not found");
    }
  }
}

const resolveEdgeWeight = (
  edge: CachedRouteEdge,
  nodeById: Map<string, CachedRouteNode>,
): number => {
  if (edge.weight != null) {
    return Number(edge.weight.toString());
  }

  const fromNode = nodeById.get(edge.fromNodeId);
  const toNode = nodeById.get(edge.toNodeId);

  if (!fromNode || !toNode) {
    return Number.POSITIVE_INFINITY;
  }

  return (
    euclideanDistance(
      Number(fromNode.xPercent.toString()),
      Number(fromNode.yPercent.toString()),
      Number(toNode.xPercent.toString()),
      Number(toNode.yPercent.toString()),
    ) * EUCLIDEAN_WEIGHT_SCALE
  );
};
