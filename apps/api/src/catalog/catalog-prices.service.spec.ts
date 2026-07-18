import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../prisma/prisma.service.js";
import { CatalogPricesService } from "./catalog-prices.service.js";

const decimal = (value: string) => ({
  toString: () => value,
  lt: (other: { toString: () => string }) =>
    Number(value) < Number(other.toString()),
  gt: (other: { toString: () => string }) =>
    Number(value) > Number(other.toString()),
});

const apartmentRow = (
  id: string,
  price: string | null,
  priceVisibility: string,
) => ({
  id,
  salesStatus: "available",
  price: price == null ? null : decimal(price),
  priceCurrency: "AMD",
  priceVisibility,
});

describe("CatalogPricesService", () => {
  const projectFindFirst = vi.fn();
  const projectFindMany = vi.fn();
  let service: CatalogPricesService;

  beforeEach(() => {
    projectFindFirst.mockReset();
    projectFindMany.mockReset();

    const prisma = {
      db: {
        project: {
          findFirst: projectFindFirst,
          findMany: projectFindMany,
        },
      },
    } as unknown as PrismaService;

    service = new CatalogPricesService(prisma);
  });

  it("throws NotFound for missing or unpublished project", async () => {
    projectFindFirst.mockResolvedValue(null);

    await expect(service.getProjectPrices("missing")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("returns only visible_after_login apartments in the overlay", async () => {
    projectFindFirst.mockResolvedValue({
      id: "proj_1",
      apartments: [
        apartmentRow("apt_public", "50000000", "public"),
        apartmentRow("apt_login", "42000000", "visible_after_login"),
        apartmentRow("apt_request", "70000000", "by_request"),
        apartmentRow("apt_login_no_price", null, "visible_after_login"),
      ],
    });

    const overlay = await service.getProjectPrices("proj_1");

    expect(overlay.apartments).toEqual([
      { id: "apt_login", price: "42000000", priceCurrency: "AMD" },
    ]);
  });

  it("aggregates the authenticated range including visible_after_login prices", async () => {
    projectFindFirst.mockResolvedValue({
      id: "proj_1",
      apartments: [
        apartmentRow("apt_public", "50000000", "public"),
        apartmentRow("apt_login", "42000000", "visible_after_login"),
      ],
    });

    const overlay = await service.getProjectPrices("proj_1");

    expect(overlay.projectId).toBe("proj_1");
    expect(overlay.minPrice).toBe("42000000");
    expect(overlay.maxPrice).toBe("50000000");
    expect(overlay.priceCurrency).toBe("AMD");
  });

  it("returns batch ranges only for published matching projects", async () => {
    projectFindMany.mockResolvedValue([
      {
        id: "proj_1",
        apartments: [apartmentRow("apt_1", "30000000", "visible_after_login")],
      },
    ]);

    const ranges = await service.getProjectPriceRanges(["proj_1", "proj_gone"]);

    expect(projectFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ["proj_1", "proj_gone"] },
          publicationStatus: "published",
        }),
      }),
    );
    expect(ranges).toEqual([
      {
        projectId: "proj_1",
        minPrice: "30000000",
        maxPrice: "30000000",
        priceCurrency: "AMD",
      },
    ]);
  });

  it("returns null range when no prices are visible even when authenticated", async () => {
    projectFindMany.mockResolvedValue([
      {
        id: "proj_1",
        apartments: [apartmentRow("apt_1", "30000000", "by_request")],
      },
    ]);

    const ranges = await service.getProjectPriceRanges(["proj_1"]);

    expect(ranges).toEqual([
      { projectId: "proj_1", minPrice: null, maxPrice: null, priceCurrency: null },
    ]);
  });
});
