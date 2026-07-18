import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../prisma/prisma.service.js";
import { CompanyProfileService } from "./company-profile.service.js";

describe("CompanyProfileService logo updates", () => {
  const companyFindUnique = vi.fn();
  const companyUpdate = vi.fn();
  const mediaFindUnique = vi.fn();
  let service: CompanyProfileService;

  const member = {
    companyId: "co_1",
    membershipId: "mem_1",
    role: "company_admin" as const,
  };

  const baseCompany = {
    id: "co_1",
    name: "Builder",
    type: "builder" as const,
    status: "active" as const,
    logoMediaId: null,
    logoMedia: null,
  };

  beforeEach(() => {
    companyFindUnique.mockReset();
    companyUpdate.mockReset();
    mediaFindUnique.mockReset();

    const prisma = {
      db: {
        company: {
          findUnique: companyFindUnique,
          update: companyUpdate,
        },
        mediaAsset: { findUnique: mediaFindUnique },
      },
    } as unknown as PrismaService;

    service = new CompanyProfileService(prisma);
  });

  it("rejects logo media that does not exist", async () => {
    companyFindUnique.mockResolvedValue(baseCompany);
    mediaFindUnique.mockResolvedValue(null);

    await expect(
      service.updateMyCompany(member, { logoMediaId: "media_missing" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects logo media owned by another company", async () => {
    companyFindUnique.mockResolvedValue(baseCompany);
    mediaFindUnique.mockResolvedValue({
      id: "media_1",
      ownerCompanyId: "co_other",
    });

    await expect(
      service.updateMyCompany(member, { logoMediaId: "media_1" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("accepts company-owned logo media", async () => {
    companyFindUnique
      .mockResolvedValueOnce(baseCompany)
      .mockResolvedValueOnce({
        ...baseCompany,
        logoMediaId: "media_1",
        logoMedia: { fileUrl: "https://cdn.example/logo.png" },
      });
    mediaFindUnique.mockResolvedValue({
      id: "media_1",
      ownerCompanyId: "co_1",
    });
    companyUpdate.mockResolvedValue({ id: "co_1" });

    const assigned = await service.updateMyCompany(member, {
      logoMediaId: "media_1",
    });

    expect(companyUpdate).toHaveBeenCalledWith({
      where: { id: "co_1" },
      data: { logoMediaId: "media_1" },
    });
    expect(assigned.logoUrl).toBe("https://cdn.example/logo.png");
  });

  it("clears logo when null is sent", async () => {
    companyFindUnique
      .mockResolvedValueOnce(baseCompany)
      .mockResolvedValueOnce(baseCompany);
    companyUpdate.mockResolvedValue({ id: "co_1" });

    const cleared = await service.updateMyCompany(member, { logoMediaId: null });

    expect(companyUpdate).toHaveBeenCalledWith({
      where: { id: "co_1" },
      data: { logoMediaId: null },
    });
    expect(cleared.logoUrl).toBeNull();
  });
});
