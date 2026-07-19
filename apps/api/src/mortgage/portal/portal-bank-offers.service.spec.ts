import { ForbiddenException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PartnerCompanyType } from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { PortalBankOffersService } from "./portal-bank-offers.service.js";

describe("PortalBankOffersService company scoping", () => {
  const partnerCompanyFindUnique = vi.fn();
  const bankOfferFindMany = vi.fn();
  let service: PortalBankOffersService;

  const member = {
    companyId: "co_bank",
    userId: "user_1",
    role: "company_admin" as const,
    companyType: "bank" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    const prisma = {
      db: {
        partnerCompany: { findUnique: partnerCompanyFindUnique },
        bankOffer: { findMany: bankOfferFindMany },
      },
    } as unknown as PrismaService;

    service = new PortalBankOffersService(prisma);
    bankOfferFindMany.mockResolvedValue([]);
  });

  it("scopes list queries to the authenticated company's bank partner profile", async () => {
    partnerCompanyFindUnique.mockResolvedValue({
      id: "partner_bank",
      type: PartnerCompanyType.bank,
    });

    await service.list(member);

    expect(bankOfferFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { partnerCompanyId: "partner_bank" },
      }),
    );
  });

  it("rejects non-bank partner companies", async () => {
    partnerCompanyFindUnique.mockResolvedValue({
      id: "partner_other",
      type: PartnerCompanyType.supplier,
    });

    await expect(service.list(member)).rejects.toBeInstanceOf(ForbiddenException);
    expect(bankOfferFindMany).not.toHaveBeenCalled();
  });
});
