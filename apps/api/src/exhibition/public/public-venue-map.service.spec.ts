import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { PublicVenueMapSnapshotStatus, PublicationStatus } from "@toonexpo/db";

import { PublicVenueMapService } from "./public-venue-map.service.js";
import type { PrismaService } from "../../prisma/prisma.service.js";

describe("PublicVenueMapService", () => {
  const findFirst = vi.fn();
  let service: PublicVenueMapService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PublicVenueMapService({
      db: { publicVenueMapSnapshot: { findFirst } },
    } as unknown as PrismaService);
  });

  it("throws when no active snapshot exists", async () => {
    findFirst.mockResolvedValue(null);
    await expect(service.getCurrent()).rejects.toBeInstanceOf(NotFoundException);
  });

  it("maps an active snapshot with organization and hidden areas", async () => {
    findFirst.mockResolvedValue({
      id: "snap_1",
      title: "Hall A",
      snapshotVersion: 2,
      mapWidth: 2000,
      mapHeight: 1000,
      pixelsPerMeter: 10,
      gridOriginX: 0,
      gridOriginY: 0,
      status: PublicVenueMapSnapshotStatus.active,
      backgroundMedia: { fileUrl: "https://cdn.example.com/map.png" },
      areas: [
        {
          id: "area_1",
          code: "A1",
          name: "Booth A1",
          geometry: { type: "cells", cells: [{ x: 0, y: 0 }] },
          areaSqm: 12,
          displayMode: "organization",
          publicLabel: "Builder Co",
          sortOrder: 0,
          company: {
            id: "co_1",
            name: "Builder Co",
            type: "builder",
            partnerCompany: null,
          },
        },
        {
          id: "area_2",
          code: "H1",
          name: null,
          geometry: { type: "cells", cells: [{ x: 1, y: 0 }] },
          areaSqm: 8,
          displayMode: "hidden",
          publicLabel: null,
          sortOrder: 1,
          company: {
            id: "co_secret",
            name: "Secret",
            type: "builder",
            partnerCompany: null,
          },
        },
      ],
    });

    const result = await service.getCurrent();
    expect(result.title).toBe("Hall A");
    expect(result.areas).toHaveLength(2);
    expect(result.areas[0]?.company?.href).toBe("/builders/co_1");
    expect(result.areas[0]?.sortOrder).toBe(0);
    expect(result.areas[1]?.sortOrder).toBe(1);
    expect(result.areas[1]?.company).toBeNull();
    expect(result.areas[1]?.publicLabel).toBeNull();
  });

  it("links published partners and omits unpublished partner profiles", async () => {
    findFirst.mockResolvedValue({
      id: "snap_1",
      title: "Hall A",
      snapshotVersion: 1,
      mapWidth: 100,
      mapHeight: 100,
      pixelsPerMeter: 10,
      gridOriginX: 0,
      gridOriginY: 0,
      backgroundMedia: { fileUrl: "https://cdn.example.com/map.png" },
      areas: [
        {
          id: "area_p",
          code: "P1",
          name: null,
          geometry: { type: "cells", cells: [{ x: 0, y: 0 }] },
          areaSqm: 6,
          displayMode: "organization",
          publicLabel: "Bank",
          sortOrder: 0,
          company: {
            id: "co_p",
            name: "Bank",
            type: "bank",
            partnerCompany: {
              slug: "acme-bank",
              publicationStatus: PublicationStatus.published,
            },
          },
        },
      ],
    });

    const result = await service.getCurrent();
    expect(result.areas[0]?.company?.href).toBe("/partners/acme-bank");
  });
});
