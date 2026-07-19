/**
 * Idempotent bank partner + published mortgage offer for public calculator demos/e2e.
 */
import {
  CompanySource,
  CompanyStatus,
  CompanyType,
  PartnerCompanyStatus,
  PartnerCompanyType,
  PublicationStatus,
  type PrismaClient,
} from '../src/index.js';
import { SEED_PLATFORM_ADMIN_ID } from './seed-auth.js';
import { SEED_ID_PREFIX } from './seed-data.js';

export const SEED_BANK_COMPANY_ID = `${SEED_ID_PREFIX}company_ameriabank`;
export const SEED_BANK_PARTNER_ID = `${SEED_ID_PREFIX}partner_ameriabank`;
export const SEED_BANK_OFFER_ID = `${SEED_ID_PREFIX}bank_offer_ameria_standard`;

/**
 * Upserts a published bank partner company and one public BankOffer.
 * Requires platform admin user (`SEED_PLATFORM_ADMIN_ID`) to already exist.
 */
export const upsertSeedMortgageOffer = async (prisma: PrismaClient): Promise<void> => {
  await prisma.company.upsert({
    where: { id: SEED_BANK_COMPANY_ID },
    create: {
      id: SEED_BANK_COMPANY_ID,
      name: 'Ameriabank (Seed)',
      description: 'Seed bank partner for mortgage calculator demos.',
      type: CompanyType.bank,
      status: CompanyStatus.active,
      source: CompanySource.admin,
    },
    update: {
      name: 'Ameriabank (Seed)',
      description: 'Seed bank partner for mortgage calculator demos.',
      type: CompanyType.bank,
      status: CompanyStatus.active,
      source: CompanySource.admin,
    },
  });

  const partner = await prisma.partnerCompany.upsert({
    where: { companyId: SEED_BANK_COMPANY_ID },
    create: {
      id: SEED_BANK_PARTNER_ID,
      companyId: SEED_BANK_COMPANY_ID,
      type: PartnerCompanyType.bank,
      name: 'Ameriabank',
      slug: 'ameriabank-seed',
      shortDescription: 'Seed mortgage partner',
      status: PartnerCompanyStatus.active,
      publicationStatus: PublicationStatus.published,
      featured: true,
    },
    update: {
      type: PartnerCompanyType.bank,
      name: 'Ameriabank',
      slug: 'ameriabank-seed',
      shortDescription: 'Seed mortgage partner',
      status: PartnerCompanyStatus.active,
      publicationStatus: PublicationStatus.published,
      featured: true,
    },
  });

  const now = new Date();
  await prisma.bankOffer.upsert({
    where: { id: SEED_BANK_OFFER_ID },
    create: {
      id: SEED_BANK_OFFER_ID,
      partnerCompanyId: partner.id,
      title: 'Standard residential mortgage',
      shortDescription: 'Seed offer for public calculator',
      rate: 12.5,
      apr: 13.0,
      minDownPaymentPercent: 20,
      termOptionsYears: [10, 15, 20],
      featured: true,
      sortOrder: 0,
      publicationStatus: PublicationStatus.published,
      publishedAt: now,
      createdByUserId: SEED_PLATFORM_ADMIN_ID,
      updatedByUserId: SEED_PLATFORM_ADMIN_ID,
    },
    update: {
      partnerCompanyId: partner.id,
      title: 'Standard residential mortgage',
      shortDescription: 'Seed offer for public calculator',
      rate: 12.5,
      apr: 13.0,
      minDownPaymentPercent: 20,
      termOptionsYears: [10, 15, 20],
      featured: true,
      sortOrder: 0,
      publicationStatus: PublicationStatus.published,
      publishedAt: now,
      updatedByUserId: SEED_PLATFORM_ADMIN_ID,
    },
  });
};
