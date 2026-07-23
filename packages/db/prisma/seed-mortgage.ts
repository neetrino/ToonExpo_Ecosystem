/**
 * Idempotent bank + IT partner media and mortgage offer for public demos.
 */
import {
  CompanySource,
  CompanyStatus,
  CompanyType,
  MediaAssetType,
  PartnerCompanyStatus,
  PartnerCompanyType,
  PublicationStatus,
  type PrismaClient,
} from '../src/index.js';
import { SEED_PLATFORM_ADMIN_ID } from './seed-auth.js';
import {
  DEMO_PARTNER_BANK_LOGO,
  DEMO_PARTNER_COVER,
  DEMO_PARTNER_IT_LOGO,
  SEED_ID_PREFIX,
  toSeedMediaUrl,
} from './seed-data.js';

export const SEED_BANK_COMPANY_ID = `${SEED_ID_PREFIX}company_ameriabank`;
export const SEED_BANK_PARTNER_ID = `${SEED_ID_PREFIX}partner_ameriabank`;
export const SEED_BANK_OFFER_ID = `${SEED_ID_PREFIX}bank_offer_ameria_standard`;
export const SEED_BANK_LOGO_ID = `${SEED_ID_PREFIX}media_logo_ameriabank`;
export const SEED_BANK_COVER_ID = `${SEED_ID_PREFIX}media_cover_ameriabank`;

export const SEED_IT_COMPANY_ID = `${SEED_ID_PREFIX}company_neetrino_partner`;
export const SEED_IT_PARTNER_ID = `${SEED_ID_PREFIX}partner_neetrino`;
export const SEED_IT_LOGO_ID = `${SEED_ID_PREFIX}media_logo_neetrino_partner`;
export const SEED_IT_COVER_ID = `${SEED_ID_PREFIX}media_cover_neetrino_partner`;

/**
 * Upserts published partners with logos/covers and one public BankOffer.
 */
export const upsertSeedMortgageOffer = async (prisma: PrismaClient): Promise<void> => {
  await prisma.mediaAsset.upsert({
    where: { id: SEED_BANK_LOGO_ID },
    create: {
      id: SEED_BANK_LOGO_ID,
      ownerCompanyId: null,
      type: MediaAssetType.image,
      fileUrl: toSeedMediaUrl(DEMO_PARTNER_BANK_LOGO),
      title: 'Ameriabank logo',
      altText: 'Ameriabank',
    },
    update: {
      fileUrl: toSeedMediaUrl(DEMO_PARTNER_BANK_LOGO),
      title: 'Ameriabank logo',
      altText: 'Ameriabank',
    },
  });

  await prisma.mediaAsset.upsert({
    where: { id: SEED_BANK_COVER_ID },
    create: {
      id: SEED_BANK_COVER_ID,
      ownerCompanyId: null,
      type: MediaAssetType.image,
      fileUrl: toSeedMediaUrl(DEMO_PARTNER_COVER),
      title: 'Ameriabank cover',
      altText: 'Ameriabank',
    },
    update: {
      fileUrl: toSeedMediaUrl(DEMO_PARTNER_COVER),
      title: 'Ameriabank cover',
      altText: 'Ameriabank',
    },
  });

  await prisma.company.upsert({
    where: { id: SEED_BANK_COMPANY_ID },
    create: {
      id: SEED_BANK_COMPANY_ID,
      name: 'Ameriabank (Seed)',
      description: 'Seed bank partner for mortgage calculator demos.',
      type: CompanyType.bank,
      status: CompanyStatus.active,
      source: CompanySource.admin,
      logoMediaId: SEED_BANK_LOGO_ID,
    },
    update: {
      name: 'Ameriabank (Seed)',
      description: 'Seed bank partner for mortgage calculator demos.',
      type: CompanyType.bank,
      status: CompanyStatus.active,
      source: CompanySource.admin,
      logoMediaId: SEED_BANK_LOGO_ID,
    },
  });

  await prisma.mediaAsset.update({
    where: { id: SEED_BANK_LOGO_ID },
    data: { ownerCompanyId: SEED_BANK_COMPANY_ID },
  });
  await prisma.mediaAsset.update({
    where: { id: SEED_BANK_COVER_ID },
    data: { ownerCompanyId: SEED_BANK_COMPANY_ID },
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
      logoMediaId: SEED_BANK_LOGO_ID,
      coverMediaId: SEED_BANK_COVER_ID,
    },
    update: {
      type: PartnerCompanyType.bank,
      name: 'Ameriabank',
      slug: 'ameriabank-seed',
      shortDescription: 'Seed mortgage partner',
      status: PartnerCompanyStatus.active,
      publicationStatus: PublicationStatus.published,
      featured: true,
      logoMediaId: SEED_BANK_LOGO_ID,
      coverMediaId: SEED_BANK_COVER_ID,
    },
  });

  await upsertItPartner(prisma);

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

const upsertItPartner = async (prisma: PrismaClient): Promise<void> => {
  await prisma.mediaAsset.upsert({
    where: { id: SEED_IT_LOGO_ID },
    create: {
      id: SEED_IT_LOGO_ID,
      ownerCompanyId: null,
      type: MediaAssetType.image,
      fileUrl: toSeedMediaUrl(DEMO_PARTNER_IT_LOGO),
      title: 'Tech partner logo',
      altText: 'Tech partner',
    },
    update: {
      fileUrl: toSeedMediaUrl(DEMO_PARTNER_IT_LOGO),
      title: 'Tech partner logo',
      altText: 'Tech partner',
    },
  });

  await prisma.mediaAsset.upsert({
    where: { id: SEED_IT_COVER_ID },
    create: {
      id: SEED_IT_COVER_ID,
      ownerCompanyId: null,
      type: MediaAssetType.image,
      fileUrl: toSeedMediaUrl(DEMO_PARTNER_COVER),
      title: 'Tech partner cover',
      altText: 'Tech partner',
    },
    update: {
      fileUrl: toSeedMediaUrl(DEMO_PARTNER_COVER),
      title: 'Tech partner cover',
      altText: 'Tech partner',
    },
  });

  await prisma.company.upsert({
    where: { id: SEED_IT_COMPANY_ID },
    create: {
      id: SEED_IT_COMPANY_ID,
      name: 'ToonExpo Tech Partner (Seed)',
      description: 'Seed IT / digital partner for public catalog demos.',
      type: CompanyType.partner,
      status: CompanyStatus.active,
      source: CompanySource.admin,
      logoMediaId: SEED_IT_LOGO_ID,
    },
    update: {
      name: 'ToonExpo Tech Partner (Seed)',
      description: 'Seed IT / digital partner for public catalog demos.',
      type: CompanyType.partner,
      status: CompanyStatus.active,
      logoMediaId: SEED_IT_LOGO_ID,
    },
  });

  await prisma.mediaAsset.update({
    where: { id: SEED_IT_LOGO_ID },
    data: { ownerCompanyId: SEED_IT_COMPANY_ID },
  });
  await prisma.mediaAsset.update({
    where: { id: SEED_IT_COVER_ID },
    data: { ownerCompanyId: SEED_IT_COMPANY_ID },
  });

  await prisma.partnerCompany.upsert({
    where: { companyId: SEED_IT_COMPANY_ID },
    create: {
      id: SEED_IT_PARTNER_ID,
      companyId: SEED_IT_COMPANY_ID,
      type: PartnerCompanyType.it_company,
      name: 'ToonExpo Digital',
      slug: 'toonexpo-digital-seed',
      shortDescription: 'Exhibition technology and visitor experience partner',
      status: PartnerCompanyStatus.active,
      publicationStatus: PublicationStatus.published,
      featured: true,
      logoMediaId: SEED_IT_LOGO_ID,
      coverMediaId: SEED_IT_COVER_ID,
    },
    update: {
      type: PartnerCompanyType.it_company,
      name: 'ToonExpo Digital',
      slug: 'toonexpo-digital-seed',
      shortDescription: 'Exhibition technology and visitor experience partner',
      status: PartnerCompanyStatus.active,
      publicationStatus: PublicationStatus.published,
      featured: true,
      logoMediaId: SEED_IT_LOGO_ID,
      coverMediaId: SEED_IT_COVER_ID,
    },
  });
};
