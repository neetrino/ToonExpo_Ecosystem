import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { PublicBoothSearchService } from "./public-booth-search.service.js";

describe("PublicBoothSearchService.search", () => {
  const venueMapFindFirst = vi.fn();
  const boothFindMany = vi.fn();
  const translationFindMany = vi.fn();

  let service: PublicBoothSearchService;

  beforeEach(() => {
    vi.clearAllMocks();
    venueMapFindFirst.mockResolvedValue({ id: "map_1" });
    translationFindMany.mockResolvedValue([]);

    const prisma = {
      db: {
        venueMap: { findFirst: venueMapFindFirst },
        booth: { findMany: boothFindMany },
        translation: { findMany: translationFindMany },
      },
    } as unknown as PrismaService;

    service = new PublicBoothSearchService(prisma);
  });

  it("returns empty results for queries shorter than the minimum length", async () => {
    const result = await service.search("map_1", "a");

    expect(result.data).toEqual([]);
    expect(boothFindMany).not.toHaveBeenCalled();
  });

  it("pushes contains filters into the DB query with a take limit", async () => {
    boothFindMany.mockResolvedValue([]);

    await service.search("map_1", "al");

    expect(boothFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 50,
        where: expect.objectContaining({
          venueMapId: "map_1",
          OR: expect.arrayContaining([
            expect.objectContaining({
              code: { contains: "al", mode: "insensitive" },
            }),
          ]),
        }),
      }),
    );
  });

  it("matches booths by company name", async () => {
    boothFindMany.mockResolvedValue([
      {
        id: "booth_1",
        code: "A-12",
        type: "builder",
        locationText: "Hall A",
        assignments: [
          {
            assignmentLabel: null,
            company: { id: "co_1", name: "Alpha Builders", type: "builder" },
            project: null,
          },
        ],
      },
    ]);

    const result = await service.search("map_1", "alpha");

    expect(result.data).toEqual([
      {
        name: "Alpha Builders",
        boothId: "booth_1",
        boothCode: "A-12",
        type: "builder",
        locationText: "Hall A",
      },
    ]);
  });

  it("matches booths by booth code", async () => {
    boothFindMany.mockResolvedValue([
      {
        id: "booth_2",
        code: "B-07",
        type: "bank",
        locationText: null,
        assignments: [],
      },
    ]);

    const result = await service.search("map_1", "b-07");

    expect(result.data[0]?.boothCode).toBe("B-07");
  });
});
