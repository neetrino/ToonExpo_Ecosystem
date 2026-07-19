import {
  BadRequestException,
  Injectable,
} from "@nestjs/common";
import type {
  RouteGraphPayload,
  RouteGraphResponse,
} from "@toonexpo/contracts";

import { PrismaService } from "../../prisma/prisma.service.js";
import {
  toRouteEdgeSummary,
  toRouteNodeSummary,
} from "../mappers/exhibition.mapper.js";

@Injectable()
export class AdminRouteGraphService {
  constructor(private readonly prisma: PrismaService) {}

  async getGraph(mapId: string): Promise<RouteGraphResponse> {
    const [nodes, edges] = await Promise.all([
      this.prisma.db.routeNode.findMany({ where: { venueMapId: mapId } }),
      this.prisma.db.routeEdge.findMany({ where: { venueMapId: mapId } }),
    ]);

    return {
      nodes: nodes.map(toRouteNodeSummary),
      edges: edges.map(toRouteEdgeSummary),
    };
  }

  async replaceGraph(
    mapId: string,
    body: RouteGraphPayload,
  ): Promise<RouteGraphResponse> {
    this.validateGraphPayload(body);

    return this.prisma.db.$transaction(async (tx) => {
      await tx.routeEdge.deleteMany({ where: { venueMapId: mapId } });
      await tx.routeNode.deleteMany({ where: { venueMapId: mapId } });

      const createdNodes = await Promise.all(
        body.nodes.map((node) => {
          if (!node.id) {
            throw new BadRequestException("Each route node must include an id");
          }

          return tx.routeNode.create({
            data: {
              id: node.id,
              venueMapId: mapId,
              code: node.code ?? null,
              label: node.label ?? null,
              xPercent: node.xPercent,
              yPercent: node.yPercent,
              type: node.type,
              boothId: node.boothId ?? null,
            },
          });
        }),
      );

      const nodeIds = new Set(createdNodes.map((node) => node.id));

      for (const edge of body.edges) {
        if (!nodeIds.has(edge.fromNodeId) || !nodeIds.has(edge.toNodeId)) {
          throw new BadRequestException(
            "Route edge references a node outside the payload",
          );
        }
      }

      const createdEdges = await Promise.all(
        body.edges.map((edge) =>
          tx.routeEdge.create({
            data: {
              venueMapId: mapId,
              fromNodeId: edge.fromNodeId,
              toNodeId: edge.toNodeId,
              weight: edge.weight ?? null,
              accessible: edge.accessible ?? null,
            },
          }),
        ),
      );

      return {
        nodes: createdNodes.map(toRouteNodeSummary),
        edges: createdEdges.map(toRouteEdgeSummary),
      };
    });
  }

  validateGraphPayload(body: RouteGraphPayload): void {
    const nodeIds = new Set<string>();

    for (const node of body.nodes) {
      if (!node.id) {
        throw new BadRequestException("Each route node must include an id");
      }
      if (nodeIds.has(node.id)) {
        throw new BadRequestException("Duplicate route node id in payload");
      }
      nodeIds.add(node.id);
    }

    for (const edge of body.edges) {
      if (!nodeIds.has(edge.fromNodeId) || !nodeIds.has(edge.toNodeId)) {
        throw new BadRequestException(
          "Route edge references a node outside the payload",
        );
      }
    }
  }
}
