import { BadRequestException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../prisma/prisma.service.js";
import { BuyerFavoritesService } from "./buyer-favorites.service.js";
import { FAVORITES_STATUS_BATCH_LIMIT } from "./favorites.constants.js";
import * as favoriteCatalogResolver from "./utils/favorite-catalog-resolver.js";

describe("BuyerFavoritesService", () => {
  const buyerProfileFindUnique = vi.fn();
  const projectFindFirst = vi.fn();
  const apartmentFindFirst = vi.fn();
  const buyerFavoriteFindUnique = vi.fn();
  const buyerFavoriteCreate = vi.fn();
  const buyerFavoriteDeleteMany = vi.fn();
  const buyerFavoriteFindMany = vi.fn();
  const track = vi.fn();
  const resolveFavoriteListItems = vi.spyOn(
    favoriteCatalogResolver,
    "resolveFavoriteListItems",
  );

  let service: BuyerFavoritesService;
  let prisma: PrismaService;

  beforeEach(() => {
    vi.clearAllMocks();
    buyerProfileFindUnique.mockResolvedValue({ id: "bp_1" });
    projectFindFirst.mockResolvedValue({
      id: "proj_1",
      builderCompanyId: "co_1",
    });
    buyerFavoriteFindUnique.mockResolvedValue(null);
    buyerFavoriteCreate.mockResolvedValue({ id: "fav_1" });
    buyerFavoriteDeleteMany.mockResolvedValue({ count: 1 });
    buyerFavoriteFindMany.mockResolvedValue([]);
    resolveFavoriteListItems.mockResolvedValue([]);

    prisma = {
      db: {
        buyerProfile: { findUnique: buyerProfileFindUnique },
        project: { findFirst: projectFindFirst },
        apartment: { findFirst: apartmentFindFirst },
        buyerFavorite: {
          findUnique: buyerFavoriteFindUnique,
          create: buyerFavoriteCreate,
          deleteMany: buyerFavoriteDeleteMany,
          findMany: buyerFavoriteFindMany,
        },
      },
    } as unknown as PrismaService;

    service = new BuyerFavoritesService(prisma, { track } as never);
  });

  it("adds a favorite and tracks favorite_added once", async () => {
    await service.add("user_1", "project", "proj_1");

    expect(buyerFavoriteCreate).toHaveBeenCalledOnce();
    expect(track).toHaveBeenCalledWith({
      eventType: "favorite_added",
      actorUserId: "user_1",
      actorRole: "buyer",
      companyId: "co_1",
      projectId: "proj_1",
      apartmentId: null,
    });
  });

  it("does not track favorite_added on idempotent add", async () => {
    buyerFavoriteFindUnique.mockResolvedValueOnce({ id: "fav_existing" });

    await service.add("user_1", "project", "proj_1");

    expect(buyerFavoriteCreate).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });

  it("rejects add when project is unpublished", async () => {
    projectFindFirst.mockResolvedValueOnce(null);

    await expect(service.add("user_1", "project", "proj_draft")).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(buyerFavoriteCreate).not.toHaveBeenCalled();
  });

  it("remove is idempotent when favorite is missing", async () => {
    buyerFavoriteDeleteMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      service.remove("user_1", "project", "proj_missing"),
    ).resolves.toBeUndefined();

    expect(buyerFavoriteDeleteMany).toHaveBeenCalledOnce();
  });

  it("filters unpublished targets via catalog resolver on list", async () => {
    buyerFavoriteFindMany.mockResolvedValueOnce([
      {
        id: "fav_1",
        targetType: "project",
        targetId: "proj_gone",
        createdAt: new Date("2026-07-01T00:00:00.000Z"),
      },
    ]);
    resolveFavoriteListItems.mockResolvedValueOnce([]);

    const result = await service.listMine("user_1", "hy");

    expect(resolveFavoriteListItems).toHaveBeenCalled();
    expect(result.items).toEqual([]);
  });

  it("caps batch status checks", async () => {
    const targets = Array.from({ length: FAVORITES_STATUS_BATCH_LIMIT + 1 }, (_, index) => ({
      targetType: "project" as const,
      targetId: `proj_${index}`,
    }));

    await expect(service.statusBatch("user_1", targets)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("returns favorited keys for batch status", async () => {
    buyerFavoriteFindMany.mockResolvedValueOnce([
      { targetType: "project", targetId: "proj_1" },
    ]);

    const result = await service.statusBatch("user_1", [
      { targetType: "project", targetId: "proj_1" },
      { targetType: "apartment", targetId: "apt_1" },
    ]);

    expect(result.favorited).toEqual(["project:proj_1"]);
  });
});
