import { NotFoundException } from "@nestjs/common";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { ROUTE_GRAPH_CACHE_TTL_MS } from "../exhibition.constants.js";
import { PublicRouteService } from "./public-route.service.js";
import { RouteGraphCache } from "./route-graph.cache.js";

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

    service = new PublicRouteService(
      prisma,
      { track: vi.fn() } as never,
      new RouteGraphCache(),
    );
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

describe("PublicRouteService route graph cache", () => {
  const venueMapFindFirst = vi.fn();
  const boothFindFirst = vi.fn();
  const routeNodeFindFirst = vi.fn();
  const routeNodeFindMany = vi.fn();
  const routeEdgeFindMany = vi.fn();

  let cache: RouteGraphCache;
  let service: PublicRouteService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    cache = new RouteGraphCache();

    venueMapFindFirst.mockResolvedValue({ id: "map_1" });
    boothFindFirst.mockResolvedValue({ id: "booth_1" });
    routeNodeFindFirst.mockResolvedValue({
      id: "dest_1",
      boothId: "booth_1",
    });
    routeNodeFindMany.mockResolvedValue([
      {
        id: "from_1",
        label: "Entrance",
        type: "entrance",
        xPercent: { toString: () => "0" },
        yPercent: { toString: () => "0" },
      },
      {
        id: "dest_1",
        label: "Booth",
        type: "booth",
        xPercent: { toString: () => "10" },
        yPercent: { toString: () => "0" },
      },
    ]);
    routeEdgeFindMany.mockResolvedValue([
      {
        fromNodeId: "from_1",
        toNodeId: "dest_1",
        weight: { toString: () => "1" },
      },
    ]);

    const prisma = {
      db: {
        venueMap: { findFirst: venueMapFindFirst },
        booth: { findFirst: boothFindFirst },
        routeNode: {
          findFirst: routeNodeFindFirst,
          findMany: routeNodeFindMany,
        },
        routeEdge: { findMany: routeEdgeFindMany },
      },
    } as unknown as PrismaService;

    service = new PublicRouteService(
      prisma,
      { track: vi.fn() } as never,
      cache,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads the graph once and reuses it on cache hit", async () => {
    await service.computeRoute("map_1", "from_1", "booth_1");
    await service.computeRoute("map_1", "from_1", "booth_1");

    expect(routeNodeFindMany).toHaveBeenCalledOnce();
    expect(routeEdgeFindMany).toHaveBeenCalledOnce();
  });

  it("reloads the graph after the cache TTL expires", async () => {
    await service.computeRoute("map_1", "from_1", "booth_1");
    vi.advanceTimersByTime(ROUTE_GRAPH_CACHE_TTL_MS + 1);
    await service.computeRoute("map_1", "from_1", "booth_1");

    expect(routeNodeFindMany).toHaveBeenCalledTimes(2);
    expect(routeEdgeFindMany).toHaveBeenCalledTimes(2);
  });
});
