import { BadRequestException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { AdminRouteGraphService } from "./admin-route-graph.service.js";

describe("AdminRouteGraphService.validateGraphPayload", () => {
  let service: AdminRouteGraphService;

  beforeEach(() => {
    service = new AdminRouteGraphService({} as PrismaService);
  });

  it("accepts a valid node/edge payload", () => {
    expect(() =>
      service.validateGraphPayload({
        nodes: [
          { id: "n1", xPercent: 0, yPercent: 0, type: "entrance" },
          { id: "n2", xPercent: 1, yPercent: 1, type: "booth" },
        ],
        edges: [{ fromNodeId: "n1", toNodeId: "n2" }],
      }),
    ).not.toThrow();
  });

  it("rejects edges that reference missing nodes", () => {
    expect(() =>
      service.validateGraphPayload({
        nodes: [{ id: "n1", xPercent: 0, yPercent: 0, type: "entrance" }],
        edges: [{ fromNodeId: "n1", toNodeId: "missing" }],
      }),
    ).toThrow(BadRequestException);
  });
});

describe("AdminRouteGraphService.replaceGraph", () => {
  const routeEdgeDeleteMany = vi.fn();
  const routeNodeDeleteMany = vi.fn();
  const routeNodeCreate = vi.fn();
  const routeEdgeCreate = vi.fn();
  const transaction = vi.fn();

  let service: AdminRouteGraphService;

  beforeEach(() => {
    vi.clearAllMocks();

    routeNodeCreate.mockImplementation(({ data }: { data: { id: string } }) =>
      Promise.resolve({ ...data, venueMapId: "map_1" }),
    );
    routeEdgeCreate.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: "edge_1", ...data }),
    );

    transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({
        routeEdge: {
          deleteMany: routeEdgeDeleteMany,
          create: routeEdgeCreate,
        },
        routeNode: {
          deleteMany: routeNodeDeleteMany,
          create: routeNodeCreate,
        },
      }),
    );

    const prisma = {
      db: { $transaction: transaction },
    } as unknown as PrismaService;

    service = new AdminRouteGraphService(prisma);
  });

  it("replaces graph transactionally", async () => {
    const result = await service.replaceGraph("map_1", {
      nodes: [
        { id: "n1", xPercent: 0, yPercent: 0, type: "entrance" },
        { id: "n2", xPercent: 10, yPercent: 10, type: "booth" },
      ],
      edges: [{ fromNodeId: "n1", toNodeId: "n2" }],
    });

    expect(routeEdgeDeleteMany).toHaveBeenCalled();
    expect(routeNodeDeleteMany).toHaveBeenCalled();
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
  });
});
