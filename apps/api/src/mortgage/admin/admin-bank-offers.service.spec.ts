import { BadRequestException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PartnerCompanyType } from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { AdminBankOffersService } from "./admin-bank-offers.service.js";

describe("AdminBankOffersService bank validation", () => {
  const partnerCompanyFindUnique = vi.fn();
  const bankOfferCreate = vi.fn();
  let service: AdminBankOffersService;

  beforeEach(() => {
    vi.clearAllMocks();

    const prisma = {
      db: {
        partnerCompany: { findUnique: partnerCompanyFindUnique },
        bankOffer: { create: bankOfferCreate },
      },
    } as unknown as PrismaService;

    service = new AdminBankOffersService(prisma);
  });

  it("rejects offer creation for non-bank partner companies", async () => {
    partnerCompanyFindUnique.mockResolvedValue({
      id: "partner_1",
      type: PartnerCompanyType.it_company,
    });

    await expect(
      service.create("user_1", {
        partnerCompanyId: "partner_1",
        title: "Offer",
        rate: 12.5,
        minDownPaymentPercent: 10,
        termOptionsYears: [20],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(bankOfferCreate).not.toHaveBeenCalled();
  });
});
