import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublicationStatus } from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { mapPublicCanvas } from "../mappers/visual-map.mapper.js";
import { PublicVisualMapService } from "./public-visual-map.service.js";

describe("PublicVisualMapService", () => {
  const projectFindFirst = vi.fn();
  const visualMapCanvasFindMany = vi.fn();
  const buildingFindMany = vi.fn();
  const floorFindMany = vi.fn();
  const apartmentFindMany = vi.fn();

  let service: PublicVisualMapService;

  beforeEach(() => {
    vi.clearAllMocks();
    projectFindFirst.mockResolvedValue({ id: "proj_1" });
    visualMapCanvasFindMany.mockResolvedValue([
      {
        id: "canvas_1",
        contextType: "project",
        contextId: "proj_1",
        title: "Site plan",
        description: null,
        mediaAsset: {
          id: "media_1",
          fileUrl: "https://cdn.example/site.jpg",
          thumbnailUrl: null,
          altText: null,
          title: null,
        },
        hotspots: [
          {
            id: "hs_ok",
            targetType: "building",
            targetId: "bld_ok",
            label: "Published",
            xPercent: { toString: () => "10" },
            yPercent: { toString: () => "20" },
            markerStyle: null,
            sortOrder: 0,
            publicationStatus: PublicationStatus.published,
          },
          {
            id: "hs_unpub",
            targetType: "building",
            targetId: "bld_draft",
            label: "Unpublished target",
            xPercent: { toString: () => "50" },
            yPercent: { toString: () => "60" },
            markerStyle: null,
            sortOrder: 2,
            publicationStatus: PublicationStatus.published,
          },
          {
            id: "hs_missing",
            targetType: "building",
            targetId: "bld_missing",
            label: "Missing target",
            xPercent: { toString: () => "70" },
            yPercent: { toString: () => "80" },
            markerStyle: null,
            sortOrder: 3,
            publicationStatus: PublicationStatus.published,
          },
        ],
      },
    ]);
    buildingFindMany.mockResolvedValue([
      {
        id: "bld_ok",
        name: "Tower A",
        publicationStatus: PublicationStatus.published,
      },
      {
        id: "bld_draft",
        name: "Tower B",
        publicationStatus: PublicationStatus.draft,
      },
    ]);

    const prisma = {
      db: {
        project: { findFirst: projectFindFirst },
        building: { findFirst: vi.fn(), findMany: buildingFindMany },
        floor: { findFirst: vi.fn(), findMany: floorFindMany },
        apartment: { findMany: apartmentFindMany },
        visualMapCanvas: { findMany: visualMapCanvasFindMany },
      },
    } as unknown as PrismaService;

    service = new PublicVisualMapService(prisma);
  });

  it("queries only published primary canvases for a published project", async () => {
    await service.listForProject("proj_1");

    expect(visualMapCanvasFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          contextType: "project",
          contextId: "proj_1",
          isPrimary: true,
          publicationStatus: "published",
        }),
        include: expect.objectContaining({
          hotspots: expect.objectContaining({
            where: { publicationStatus: PublicationStatus.published },
          }),
        }),
      }),
    );
  });

  it("excludes broken targets from public payload (draft hotspots filtered in query)", async () => {
    const response = await service.listForProject("proj_1");
    const canvas = response.data[0];

    expect(canvas?.hotspots).toHaveLength(1);
    expect(canvas?.hotspots[0]).toMatchObject({
      id: "hs_ok",
      target: {
        type: "building",
        id: "bld_ok",
        displayName: "Tower A",
      },
    });
  });
});

describe("mapPublicCanvas target filtering", () => {
  it("returns targetStatus-driven exclusions consistently in mapper", () => {
    const entities = {
      buildings: new Map([
        [
          "bld_ok",
          { name: "Tower A", publicationStatus: PublicationStatus.published },
        ],
      ]),
      floors: new Map(),
      apartments: new Map(),
    };

    const canvas = {
      id: "canvas_1",
      contextType: "project" as const,
      contextId: "proj_1",
      title: null,
      description: null,
      mediaAsset: {
        id: "media_1",
        fileUrl: "https://cdn.example/site.jpg",
        thumbnailUrl: null,
        altText: null,
        title: null,
      },
      hotspots: [
        {
          id: "hs_ok",
          targetType: "building" as const,
          targetId: "bld_ok",
          label: "OK",
          xPercent: { toString: () => "1" },
          yPercent: { toString: () => "2" },
          markerStyle: null,
          sortOrder: 0,
          publicationStatus: PublicationStatus.published,
        },
        {
          id: "hs_missing",
          targetType: "building" as const,
          targetId: "bld_missing",
          label: "Missing",
          xPercent: { toString: () => "3" },
          yPercent: { toString: () => "4" },
          markerStyle: null,
          sortOrder: 1,
          publicationStatus: PublicationStatus.published,
        },
      ],
    };

    const mapped = mapPublicCanvas(canvas, entities);
    expect(mapped.hotspots).toHaveLength(1);
    expect(mapped.hotspots[0]?.id).toBe("hs_ok");
  });
});

describe("Portal editor targetStatus flags", () => {
  it("marks missing and unpublished targets for editor warnings", async () => {
    const { mapPortalHotspot } = await import("../mappers/visual-map.mapper.js");
    const entities = {
      buildings: new Map([
        [
          "bld_draft",
          { name: "Draft", publicationStatus: PublicationStatus.draft },
        ],
      ]),
      floors: new Map(),
      apartments: new Map(),
    };

    const draftHotspot = mapPortalHotspot(
      {
        id: "hs_1",
        canvasId: "canvas_1",
        targetType: "building",
        targetId: "bld_draft",
        label: "Draft tower",
        xPercent: { toString: () => "10" },
        yPercent: { toString: () => "20" },
        markerStyle: null,
        publicationStatus: PublicationStatus.published,
        sortOrder: null,
        createdAt: new Date("2026-07-18T10:00:00.000Z"),
        updatedAt: new Date("2026-07-18T10:00:00.000Z"),
      },
      entities,
    );
    const missingHotspot = mapPortalHotspot(
      {
        id: "hs_2",
        canvasId: "canvas_1",
        targetType: "building",
        targetId: "bld_missing",
        label: "Missing tower",
        xPercent: { toString: () => "10" },
        yPercent: { toString: () => "20" },
        markerStyle: null,
        publicationStatus: PublicationStatus.published,
        sortOrder: null,
        createdAt: new Date("2026-07-18T10:00:00.000Z"),
        updatedAt: new Date("2026-07-18T10:00:00.000Z"),
      },
      entities,
    );

    expect(draftHotspot.targetStatus).toBe("unpublished");
    expect(missingHotspot.targetStatus).toBe("missing");
  });
});
