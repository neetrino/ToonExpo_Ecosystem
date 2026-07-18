import { beforeEach, describe, expect, it, vi } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { PublicationStatus } from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { PortalVisualMapCanvasService } from "./portal-visual-map-canvas.service.js";
import { PortalVisualMapHotspotService } from "./portal-visual-map-hotspot.service.js";
import { PortalVisualMapService } from "./portal-visual-map.service.js";

describe("PortalVisualMapService validation", () => {
  const projectFindFirst = vi.fn();
  const buildingFindFirst = vi.fn();
  const floorFindFirst = vi.fn();
  const apartmentFindFirst = vi.fn();
  const mediaAssetFindUnique = vi.fn();
  const visualMapCanvasFindFirst = vi.fn();
  const visualMapCanvasUpdateMany = vi.fn();
  const visualMapCanvasCreate = vi.fn();
  const visualHotspotCreate = vi.fn();

  let service: PortalVisualMapService;

  const member = {
    companyId: "co_1",
    membershipId: "mem_1",
    role: "member" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    projectFindFirst.mockResolvedValue({ id: "proj_1", builderCompanyId: "co_1" });
    buildingFindFirst.mockResolvedValue(null);
    floorFindFirst.mockResolvedValue(null);
    apartmentFindFirst.mockResolvedValue(null);
    mediaAssetFindUnique.mockResolvedValue({
      id: "media_1",
      ownerCompanyId: "co_1",
    });
    visualMapCanvasFindFirst.mockResolvedValue({
      id: "canvas_1",
      ownerCompanyId: "co_1",
      projectId: "proj_1",
      contextType: "project",
      contextId: "proj_1",
      hotspots: [],
      mediaAsset: {
        id: "media_1",
        fileUrl: "https://cdn.example/image.jpg",
        thumbnailUrl: null,
        altText: null,
        title: null,
      },
    });
    visualMapCanvasUpdateMany.mockResolvedValue({ count: 0 });
    visualMapCanvasCreate.mockResolvedValue({
      id: "canvas_new",
      ownerCompanyId: "co_1",
      projectId: "proj_1",
      contextType: "building",
      contextId: "bld_1",
      mediaAssetId: "media_1",
      title: null,
      description: null,
      publicationStatus: PublicationStatus.draft,
      isPrimary: true,
      sortOrder: 0,
      createdAt: new Date("2026-07-18T10:00:00.000Z"),
      updatedAt: new Date("2026-07-18T10:00:00.000Z"),
      hotspots: [],
      mediaAsset: {
        id: "media_1",
        fileUrl: "https://cdn.example/image.jpg",
        thumbnailUrl: null,
        altText: null,
        title: null,
      },
    });
    visualHotspotCreate.mockResolvedValue({
      id: "hotspot_1",
      canvasId: "canvas_1",
      targetType: "building",
      targetId: "bld_other",
      label: "Tower A",
      xPercent: { toString: () => "10.5" },
      yPercent: { toString: () => "20" },
      markerStyle: null,
      publicationStatus: PublicationStatus.draft,
      sortOrder: null,
      createdAt: new Date("2026-07-18T10:00:00.000Z"),
      updatedAt: new Date("2026-07-18T10:00:00.000Z"),
    });

    const prisma = {
      db: {
        project: { findFirst: projectFindFirst },
        building: { findFirst: buildingFindFirst, findMany: vi.fn().mockResolvedValue([]) },
        floor: { findFirst: floorFindFirst, findMany: vi.fn().mockResolvedValue([]) },
        apartment: {
          findFirst: apartmentFindFirst,
          findMany: vi.fn().mockResolvedValue([]),
        },
        mediaAsset: { findUnique: mediaAssetFindUnique },
        visualMapCanvas: {
          findMany: vi.fn(),
          findFirst: visualMapCanvasFindFirst,
          create: visualMapCanvasCreate,
          update: vi.fn(),
          updateMany: visualMapCanvasUpdateMany,
          delete: vi.fn(),
        },
        visualHotspot: {
          create: visualHotspotCreate,
          update: vi.fn(),
          findFirst: vi.fn(),
          delete: vi.fn(),
        },
      },
    } as unknown as PrismaService;

    service = new PortalVisualMapService(
      new PortalVisualMapCanvasService(prisma),
      new PortalVisualMapHotspotService(prisma),
    );
  });

  it("rejects building context outside the project", async () => {
    await expect(
      service.create(member, "user_1", "proj_1", {
        contextType: "building",
        contextId: "bld_other",
        mediaAssetId: "media_1",
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("clears previous primary when creating a primary canvas", async () => {
    buildingFindFirst.mockResolvedValue({ id: "bld_1" });

    await service.create(member, "user_1", "proj_1", {
      contextType: "building",
      contextId: "bld_1",
      mediaAssetId: "media_1",
      isPrimary: true,
    });

    expect(visualMapCanvasUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          contextType: "building",
          contextId: "bld_1",
          isPrimary: true,
        }),
        data: { isPrimary: false },
      }),
    );
  });

  it("rejects cross-project building hotspot targets", async () => {
    buildingFindFirst.mockResolvedValue(null);

    await expect(
      service.createHotspot(member, "user_1", "canvas_1", {
        targetType: "building",
        targetId: "bld_other",
        label: "Other",
        xPercent: 50,
        yPercent: 50,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects wrong hotspot target type for project canvas", async () => {
    await expect(
      service.createHotspot(member, "user_1", "canvas_1", {
        targetType: "floor",
        targetId: "floor_1",
        label: "Floor",
        xPercent: 50,
        yPercent: 50,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects hotspot coordinates outside bounds", async () => {
    await expect(
      service.createHotspot(member, "user_1", "canvas_1", {
        targetType: "building",
        targetId: "bld_1",
        label: "Tower",
        xPercent: 101,
        yPercent: 50,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
