import { Injectable, NotFoundException } from "@nestjs/common";
import type { RoutePathResponse } from "@toonexpo/contracts";
import {
  EventStatus,
  PublicationStatus,
} from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";
import { EUCLIDEAN_WEIGHT_SCALE } from "../exhibition.constants.js";
import {
  dijkstraShortestPath,
  euclideanDistance,
  type GraphEdge,
  type GraphNode,
} from "../utils/dijkstra.js";

@Injectable()
export class PublicRouteService {
  constructor(private readonly prisma: PrismaService) {}

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

    const destinationNode = await this.prisma.db.routeNode.findFirst({
      where: { venueMapId: mapId, boothId: toBoothId },
      orderBy: [{ createdAt: "asc" }],
    });

    if (!destinationNode) {
      return { routeAvailable: false, nodes: [] };
    }

    const [nodes, edges] = await Promise.all([
      this.prisma.db.routeNode.findMany({ where: { venueMapId: mapId } }),
      this.prisma.db.routeEdge.findMany({ where: { venueMapId: mapId } }),
    ]);

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
      .filter((node): node is NonNullable<typeof node> => node != null)
      .map((node) => ({
        id: node.id,
        xPercent: node.xPercent.toString(),
        yPercent: node.yPercent.toString(),
        label: node.label,
        type: node.type,
      }));

    return { routeAvailable: true, nodes: pathNodes };
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
  edge: {
    fromNodeId: string;
    toNodeId: string;
    weight: { toString(): string } | null;
  },
  nodeById: Map<
    string,
    { xPercent: { toString(): string }; yPercent: { toString(): string } }
  >,
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
