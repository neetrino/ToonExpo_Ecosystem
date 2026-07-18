import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PartnerCompanyType } from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";

type BankOfferClient = PrismaService["db"];

export const bankOfferNotFound = (): NotFoundException =>
  new NotFoundException("Bank offer not found");

export const assertBankPartnerCompany = async (
  db: BankOfferClient,
  partnerCompanyId: string,
): Promise<void> => {
  const partner = await db.partnerCompany.findUnique({
    where: { id: partnerCompanyId },
    select: { id: true, type: true },
  });

  if (!partner) {
    throw new NotFoundException("Partner company not found");
  }

  if (partner.type !== PartnerCompanyType.bank) {
    throw new BadRequestException("Bank offers require a bank partner company");
  }
};

export const requireBankPartnerForCompany = async (
  db: BankOfferClient,
  companyId: string,
) => {
  const partner = await db.partnerCompany.findUnique({
    where: { companyId },
    select: { id: true, type: true },
  });

  if (!partner) {
    throw new NotFoundException("Partner profile not found");
  }

  if (partner.type !== PartnerCompanyType.bank) {
    throw new ForbiddenException("Bank partner profile required");
  }

  return partner;
};

export const requireOwnedBankOffer = async (
  db: BankOfferClient,
  partnerCompanyId: string,
  offerId: string,
) => {
  const offer = await db.bankOffer.findFirst({
    where: { id: offerId, partnerCompanyId },
  });

  if (!offer) {
    throw bankOfferNotFound();
  }

  return offer;
};
