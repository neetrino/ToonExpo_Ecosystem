import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { CompanyType } from "@toonexpo/db";

import { loadTranslations } from "../../catalog/utils/load-translations.js";
import { TRANSLATION_ENTITY } from "../../catalog/utils/resolve-translation.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { buildProjectSlug } from "../../portal/utils/slug.js";
import { PARTNER_COMPATIBLE_COMPANY_TYPES } from "../partners.constants.js";

type PartnerCompanyClient = PrismaService["db"];

/**
 * Ensures the company exists and can host a partner profile.
 */
export const assertPartnerCompatibleCompany = async (
  db: PartnerCompanyClient,
  companyId: string,
): Promise<void> => {
  const company = await db.company.findUnique({ where: { id: companyId } });

  if (!company) {
    throw new NotFoundException("Company not found");
  }

  if (
    !PARTNER_COMPATIBLE_COMPANY_TYPES.includes(
      company.type as (typeof PARTNER_COMPATIBLE_COMPANY_TYPES)[number],
    )
  ) {
    throw new BadRequestException(
      "Company type must be partner, bank, or service",
    );
  }
};

/**
 * Resolves a unique slug, generating from name when omitted.
 */
export const resolvePartnerSlug = async (
  db: PartnerCompanyClient,
  name: string,
  requestedSlug?: string,
  excludePartnerId?: string,
): Promise<string> => {
  const base = requestedSlug?.trim() || buildProjectSlug(name);
  let candidate = base;
  let attempt = 0;

  while (await slugTaken(db, candidate, excludePartnerId)) {
    attempt += 1;
    candidate = buildProjectSlug(`${name}-${attempt}`);
    if (attempt > 20) {
      throw new ConflictException("Unable to generate a unique slug");
    }
  }

  return candidate;
};

const slugTaken = async (
  db: PartnerCompanyClient,
  slug: string,
  excludePartnerId?: string,
): Promise<boolean> => {
  const existing = await db.partnerCompany.findUnique({ where: { slug } });
  if (!existing) {
    return false;
  }
  return existing.id !== excludePartnerId;
};

export const loadPartnerTranslationRows = async (
  db: PartnerCompanyClient,
  partnerId: string,
  offerIds: string[],
) => {
  const partnerRows = await loadTranslations(
    db,
    TRANSLATION_ENTITY.partnerCompany,
    [partnerId],
  );
  const offerRows =
    offerIds.length > 0
      ? await loadTranslations(db, TRANSLATION_ENTITY.partnerOffer, offerIds)
      : [];

  return [...partnerRows, ...offerRows];
};

export const partnerNotFound = (): NotFoundException =>
  new NotFoundException("Partner profile not found");

export const offerNotFound = (): NotFoundException =>
  new NotFoundException("Partner offer not found");

export const isPartnerCompatibleType = (type: CompanyType): boolean =>
  type === CompanyType.partner ||
  type === CompanyType.bank ||
  type === CompanyType.service;
