import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../prisma/prisma.service.js";

describe("resolvePartnerSlug", () => {
  const partnerCompanyFindUnique = vi.fn();

  beforeEach(() => {
    partnerCompanyFindUnique.mockReset();
  });

  it("generates a slug from name when slug is not provided", async () => {
    partnerCompanyFindUnique.mockResolvedValue(null);

    const { resolvePartnerSlug } = await import("../utils/partner-access.js");
    const slug = await resolvePartnerSlug(
      prismaFromMocks(partnerCompanyFindUnique),
      "Acme Partner",
    );

    expect(slug).toMatch(/^acme-partner-[a-f0-9]+$/);
  });

  it("appends suffix when requested slug is already taken", async () => {
    partnerCompanyFindUnique
      .mockResolvedValueOnce({ id: "other", slug: "taken-slug" })
      .mockResolvedValue(null);

    const { resolvePartnerSlug } = await import("../utils/partner-access.js");
    const slug = await resolvePartnerSlug(
      prismaFromMocks(partnerCompanyFindUnique),
      "Partner Co",
      "taken-slug",
    );

    expect(slug).not.toBe("taken-slug");
    expect(partnerCompanyFindUnique.mock.calls.length).toBeGreaterThan(1);
  });

  it("allows keeping slug when updating the same partner", async () => {
    partnerCompanyFindUnique.mockResolvedValue({
      id: "pc_1",
      slug: "same-slug",
    });

    const { resolvePartnerSlug } = await import("../utils/partner-access.js");
    const slug = await resolvePartnerSlug(
      prismaFromMocks(partnerCompanyFindUnique),
      "Partner Co",
      "same-slug",
      "pc_1",
    );

    expect(slug).toBe("same-slug");
  });
});

const prismaFromMocks = (
  partnerCompanyFindUnique: ReturnType<typeof vi.fn>,
): PrismaService["db"] =>
  ({
    partnerCompany: { findUnique: partnerCompanyFindUnique },
  }) as unknown as PrismaService["db"];
