import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublicationStatus } from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { PortalPartnerService } from "./portal-partner.service.js";

describe("PortalPartnerService field whitelist", () => {
  const partnerCompanyFindUnique = vi.fn();
  const partnerCompanyUpdate = vi.fn();
  const translationUpsert = vi.fn();
  const translationFindMany = vi.fn();
  let service: PortalPartnerService;

  const member = {
    companyId: "co_partner",
    membershipId: "mem_1",
    role: "company_admin" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    partnerCompanyFindUnique.mockResolvedValue({
      id: "pc_1",
      companyId: "co_partner",
      type: "bank",
      name: "Partner",
      slug: "partner",
      status: "active",
      publicationStatus: PublicationStatus.published,
      featured: true,
      shortDescription: null,
      fullDescription: null,
      contacts: null,
      website: null,
      socialLinks: null,
      logoMediaId: null,
      coverMediaId: null,
      createdAt: new Date("2026-07-18T10:00:00.000Z"),
      updatedAt: new Date("2026-07-18T10:00:00.000Z"),
      offers: [],
    });
    partnerCompanyUpdate.mockResolvedValue({});
    translationUpsert.mockResolvedValue({});
    translationFindMany.mockResolvedValue([]);

    const prisma = {
      db: {
        partnerCompany: {
          findUnique: partnerCompanyFindUnique,
          update: partnerCompanyUpdate,
        },
        translation: {
          upsert: translationUpsert,
          findMany: translationFindMany,
        },
      },
    } as unknown as PrismaService;

    service = new PortalPartnerService(prisma);
  });

  it("exposes only content fields as portal-editable", () => {
    const keys = service.portalEditableFieldKeys();

    expect(keys).toEqual([
      "shortDescription",
      "fullDescription",
      "contacts",
      "website",
      "socialLinks",
      "logoMediaId",
      "coverMediaId",
      "translations",
    ]);
    expect(keys).not.toContain("status");
    expect(keys).not.toContain("slug");
    expect(keys).not.toContain("publicationStatus");
    expect(keys).not.toContain("featured");
    expect(keys).not.toContain("type");
  });

  it("updates only whitelisted profile columns", async () => {
    await service.updateOwnProfile(member, "user_1", {
      shortDescription: "Updated",
      website: "https://example.com",
    });

    const updateData = partnerCompanyUpdate.mock.calls[0]?.[0]?.data;
    expect(updateData).toEqual({
      shortDescription: "Updated",
      website: "https://example.com",
    });
    expect(updateData).not.toHaveProperty("status");
    expect(updateData).not.toHaveProperty("slug");
    expect(updateData).not.toHaveProperty("publicationStatus");
    expect(updateData).not.toHaveProperty("featured");
    expect(updateData).not.toHaveProperty("type");
  });
});
