import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  PartnerCompanyStatus,
  PublicationStatus,
} from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { ListPublicPartnersQueryDto } from "./dto/list-public-partners.query.dto.js";
import { PublicPartnersService } from "./public-partners.service.js";

describe("PublicPartnersService visibility rules", () => {
  const partnerCompanyCount = vi.fn();
  const partnerCompanyFindMany = vi.fn();
  const partnerCompanyFindFirst = vi.fn();
  const translationFindMany = vi.fn();
  let service: PublicPartnersService;

  beforeEach(() => {
    vi.clearAllMocks();
    translationFindMany.mockResolvedValue([]);

    const prisma = {
      db: {
        partnerCompany: {
          count: partnerCompanyCount,
          findMany: partnerCompanyFindMany,
          findFirst: partnerCompanyFindFirst,
        },
        translation: { findMany: translationFindMany },
        $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
      },
    } as unknown as PrismaService;

    service = new PublicPartnersService(prisma);
    partnerCompanyCount.mockResolvedValue(0);
    partnerCompanyFindMany.mockResolvedValue([]);
  });

  it("lists only active published partners", () => {
    const where = service.buildPublicWhere(new ListPublicPartnersQueryDto());

    expect(where).toEqual({
      status: PartnerCompanyStatus.active,
      publicationStatus: PublicationStatus.published,
    });
  });

  it("adds type and featured filters when provided", () => {
    const query = Object.assign(new ListPublicPartnersQueryDto(), {
      type: "bank",
      featured: true,
    });

    const where = service.buildPublicWhere(query);

    expect(where.type).toBe("bank");
    expect(where.featured).toBe(true);
  });

  it("queries public detail with active+published gate and published offers only", async () => {
    partnerCompanyFindFirst.mockResolvedValue(null);

    await expect(service.getBySlug("draft-partner")).rejects.toThrow(
      "Partner not found",
    );

    expect(partnerCompanyFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: "draft-partner",
          status: PartnerCompanyStatus.active,
          publicationStatus: PublicationStatus.published,
        },
        include: expect.objectContaining({
          offers: expect.objectContaining({
            where: { publicationStatus: PublicationStatus.published },
          }),
        }),
      }),
    );
  });

  it("returns only published offers in public detail mapping", async () => {
    partnerCompanyFindFirst.mockResolvedValue({
      id: "pc_1",
      type: "bank",
      name: "Acme Bank",
      slug: "acme-bank",
      shortDescription: "Hy short",
      fullDescription: "Hy full",
      contacts: null,
      website: null,
      socialLinks: null,
      featured: false,
      logoMedia: null,
      coverMedia: null,
      offers: [
        {
          id: "offer_pub",
          title: "Published",
          description: "Visible",
          type: "loan",
          sortOrder: 0,
        },
      ],
    });

    const result = await service.getBySlug("acme-bank", "en");

    expect(result.offers).toHaveLength(1);
    expect(result.offers[0]?.id).toBe("offer_pub");
  });
});
