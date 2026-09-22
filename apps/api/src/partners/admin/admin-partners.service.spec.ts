import { ConflictException } from "@nestjs/common";
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

    expect(slug).toBe("acme-partner");
  });

  it("appends a numeric suffix when the requested slug is already taken", async () => {
    partnerCompanyFindUnique
      .mockResolvedValueOnce({ id: "other", slug: "taken-slug" })
      .mockResolvedValue(null);

    const { resolvePartnerSlug } = await import("../utils/partner-access.js");
    const slug = await resolvePartnerSlug(
      prismaFromMocks(partnerCompanyFindUnique),
      "Partner Co",
      "taken-slug",
    );

    expect(slug).toBe("taken-slug-2");
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

  it("rejects an edited slug owned by another partner", async () => {
    partnerCompanyFindUnique.mockResolvedValue({
      id: "other",
      slug: "taken-slug",
    });

    const { resolvePartnerSlug } = await import("../utils/partner-access.js");

    await expect(
      resolvePartnerSlug(
        prismaFromMocks(partnerCompanyFindUnique),
        "Partner Co",
        "taken-slug",
        "pc_1",
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

const prismaFromMocks = (
  partnerCompanyFindUnique: ReturnType<typeof vi.fn>,
): PrismaService["db"] =>
  ({
    partnerCompany: { findUnique: partnerCompanyFindUnique },
  }) as unknown as PrismaService["db"];
