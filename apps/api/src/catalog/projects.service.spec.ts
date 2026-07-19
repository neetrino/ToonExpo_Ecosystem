import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../prisma/prisma.service.js";
import { ListProjectsQueryDto } from "./dto/list-projects.query.dto.js";
import { ProjectsService } from "./projects.service.js";

describe("ProjectsService filters and pagination", () => {
  const projectCount = vi.fn();
  const projectFindMany = vi.fn();
  let service: ProjectsService;

  beforeEach(() => {
    projectCount.mockReset();
    projectFindMany.mockReset();

    const prisma = {
      db: {
        project: {
          count: projectCount,
          findMany: projectFindMany,
        },
        translation: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      },
    } as unknown as PrismaService;

    service = new ProjectsService(prisma, { track: vi.fn() } as never);
  });

  it("builds where for published projects only by default", () => {
    const where = service.buildListWhere(new ListProjectsQueryDto());

    expect(where).toEqual({ publicationStatus: "published" });
  });

  it("adds apartment filters for sales status, rooms and price range", () => {
    const query = Object.assign(new ListProjectsQueryDto(), {
      salesStatus: "available",
      rooms: 2,
      minPrice: 40_000_000,
      maxPrice: 80_000_000,
      city: "Yerevan",
      builderId: "builder_1",
    });

    const where = service.buildListWhere(query);

    expect(where.city).toEqual({ equals: "Yerevan", mode: "insensitive" });
    expect(where.builderCompanyId).toBe("builder_1");
    expect(where.apartments).toEqual({
      some: {
        publicationStatus: "published",
        salesStatus: "available",
        rooms: 2,
        price: { gte: 40_000_000, lte: 80_000_000 },
        priceVisibility: "public",
      },
    });
  });

  it("paginates with skip/take derived from page and pageSize", async () => {
    projectCount.mockResolvedValue(45);
    projectFindMany.mockResolvedValue([]);

    const query = Object.assign(new ListProjectsQueryDto(), {
      page: 2,
      pageSize: 10,
    });

    const result = await service.listProjects(query, {
      isAuthenticated: false,
    });

    expect(projectFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
    expect(result.meta).toEqual({
      page: 2,
      pageSize: 10,
      total: 45,
      totalPages: 5,
    });
  });

  it("returns totalPages 0 when there are no projects", async () => {
    projectCount.mockResolvedValue(0);
    projectFindMany.mockResolvedValue([]);

    const result = await service.listProjects(new ListProjectsQueryDto(), {
      isAuthenticated: false,
    });

    expect(result.meta.totalPages).toBe(0);
    expect(result.data).toEqual([]);
  });
});
