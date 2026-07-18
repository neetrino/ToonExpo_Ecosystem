import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { PublicRouteService } from "./public-route.service.js";

describe("PublicRouteService.listEntranceNodes", () => {
  const venueMapFindFirst = vi.fn();
  const routeNodeFindMany = vi.fn();

  let service: PublicRouteService;

  beforeEach(() => {
    vi.clearAllMocks();

    const prisma = {
      db: {
        venueMap: { findFirst: venueMapFindFirst },
        routeNode: { findMany: routeNodeFindMany },
      },
    } as unknown as PrismaService;

    service = new PublicRouteService(prisma);
  });

  it("returns entrance nodes for a published venue map", async () => {
    venueMapFindFirst.mockResolvedValue({ id: "map_1" });
    routeNodeFindMany.mockResolvedValue([
      {
        id: "node_1",
        code: "E1",
        label: "Main entrance",
        xPercent: { toString: () => "10.5" },
        yPercent: { toString: () => "20" },
      },
    ]);

    const result = await service.listEntranceNodes("map_1");

    expect(result.data).toEqual([
      {
        id: "node_1",
        code: "E1",
        label: "Main entrance",
        xPercent: "10.5",
        yPercent: "20",
      },
    ]);
    expect(routeNodeFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { venueMapId: "map_1", type: "entrance" },
      }),
    );
  });

  it("rejects unpublished venue maps", async () => {
    venueMapFindFirst.mockResolvedValue(null);

    await expect(service.listEntranceNodes("map_draft")).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(routeNodeFindMany).not.toHaveBeenCalled();
  });
});
