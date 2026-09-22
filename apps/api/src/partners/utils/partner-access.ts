import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { CompanyType, type Prisma } from "@toonexpo/db";

import { loadTranslations } from "../../catalog/utils/load-translations.js";
import { TRANSLATION_ENTITY } from "../../catalog/utils/resolve-translation.js";
import {
  allocateUniqueSlug,
  insertWithUniqueSlug,
  uniqueConstraintTargetsSlug,
} from "../../common/utils/allocate-unique-slug.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { PORTAL_SLUG_MAX_LENGTH } from "../../portal/portal.constants.js";
import { normalizePortalSlug } from "../../portal/utils/slug.js";
import { PARTNER_COMPATIBLE_COMPANY_TYPES } from "../partners.constants.js";

type PartnerCompanyClient = PrismaService["db"];

type PartnerSlugDb = PrismaService["db"] | Prisma.TransactionClient;

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

const PARTNER_SLUG_FALLBACK = "partner";

export const PARTNER_SLUG_CONFLICT_MESSAGE = "Partner slug already exists";

/**
 * Resolves a unique slug from a name, or rejects an edited slug that another partner owns.
 */
export const resolvePartnerSlug = async (
  db: PartnerSlugDb,
  name: string,
  requestedSlug?: string,
  excludePartnerId?: string,
): Promise<string> => {
  const explicit = requestedSlug?.trim();
  const base = normalizePortalSlug(explicit || name, PARTNER_SLUG_FALLBACK);
  if (explicit && excludePartnerId) {
    if (await slugTaken(db, base, excludePartnerId)) {
      throw new ConflictException(PARTNER_SLUG_CONFLICT_MESSAGE);
    }
    return base;
  }

  return allocateUniqueSlug({
    base,
    maxLength: PORTAL_SLUG_MAX_LENGTH,
    isTaken: (candidate) => slugTaken(db, candidate, excludePartnerId),
  });
};

/**
 * Inserts a partner row, retrying `-2`, `-3` when the slug loses a race.
 */
export const insertPartnerWithUniqueSlug = <T>(
  db: PartnerSlugDb,
  name: string,
  insert: (slug: string) => Promise<T>,
): Promise<T> =>
  insertWithUniqueSlug({
    base: normalizePortalSlug(name, PARTNER_SLUG_FALLBACK),
    maxLength: PORTAL_SLUG_MAX_LENGTH,
    isTaken: (candidate) => slugTaken(db, candidate),
    insert,
  });

/**
 * Turns a lost partner-slug race on update into a conflict.
 */
export const rethrowPartnerSlugConflict = (error: unknown): void => {
  if (uniqueConstraintTargetsSlug(error)) {
    throw new ConflictException(PARTNER_SLUG_CONFLICT_MESSAGE);
  }
};

const slugTaken = async (
  db: PartnerSlugDb,
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
