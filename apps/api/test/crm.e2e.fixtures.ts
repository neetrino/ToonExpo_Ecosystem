import {
  AccountType,
  ApartmentSalesStatus,
  CompanyMemberRole,
  CompanyMemberStatus,
  CompanySource,
  CompanyStatus,
  CompanyType,
  CrmStatusSource,
  PriceVisibility,
  PublicationStatus,
  QrScanContext,
  QrScanResultStatus,
  UserStatus,
} from '@toonexpo/db';

import { hashPassword } from '../src/auth/utils/password.util.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { uniqueEmail } from './helpers/e2e-http.js';

export const CRM_FIXTURE_PREFIX = 'e2e_crm_';
export const CRM_E2E_PASSWORD = 'crm-e2e-pass-123';

export type CrmFixtureIds = {
  companyId: string;
  otherCompanyId: string;
  buyerEmail: string;
  otherBuyerEmail: string;
  builderEmail: string;
  otherBuilderEmail: string;
  buyerProfileId: string;
  projectId: string;
  apartmentId: string;
  foreignApartmentId: string;
  qrCodeId: string;
  scanEventId: string;
  createdUserIds: string[];
  createdCompanyIds: string[];
};

export async function seedCrmFixtures(
  prisma: PrismaService,
  password: string,
): Promise<CrmFixtureIds> {
  const passwordHash = await hashPassword(password);
  const buyerEmail = uniqueEmail(CRM_FIXTURE_PREFIX, 'buyer');
  const otherBuyerEmail = uniqueEmail(CRM_FIXTURE_PREFIX, 'other_buyer');
  const builderEmail = uniqueEmail(CRM_FIXTURE_PREFIX, 'builder');
  const otherBuilderEmail = uniqueEmail(CRM_FIXTURE_PREFIX, 'other_builder');
  const createdUserIds: string[] = [];
  const createdCompanyIds: string[] = [];

  const company = await prisma.db.company.create({
    data: {
      name: `${CRM_FIXTURE_PREFIX}Builder`,
      type: CompanyType.builder,
      status: CompanyStatus.active,
      source: CompanySource.admin,
    },
  });
  createdCompanyIds.push(company.id);

  const otherCompany = await prisma.db.company.create({
    data: {
      name: `${CRM_FIXTURE_PREFIX}OtherBuilder`,
      type: CompanyType.builder,
      status: CompanyStatus.active,
      source: CompanySource.admin,
    },
  });
  createdCompanyIds.push(otherCompany.id);

  const buyer = await prisma.db.user.create({
    data: {
      name: 'CRM Buyer',
      email: buyerEmail,
      phone: '+37491110001',
      passwordHash,
      accountType: AccountType.buyer,
      status: UserStatus.active,
      buyerProfile: {
        create: {
          name: 'CRM Buyer',
          phone: '+37491110001',
          email: buyerEmail,
        },
      },
    },
    include: { buyerProfile: true },
  });
  createdUserIds.push(buyer.id);

  const otherBuyer = await prisma.db.user.create({
    data: {
      name: 'Other Buyer',
      email: otherBuyerEmail,
      phone: '+37491110002',
      passwordHash,
      accountType: AccountType.buyer,
      status: UserStatus.active,
      buyerProfile: {
        create: {
          name: 'Other Buyer',
          phone: '+37491110002',
          email: otherBuyerEmail,
        },
      },
    },
  });
  createdUserIds.push(otherBuyer.id);

  const builder = await prisma.db.user.create({
    data: {
      name: 'CRM Builder',
      email: builderEmail,
      passwordHash,
      accountType: AccountType.company_member,
      status: UserStatus.active,
      companyMembership: {
        create: {
          companyId: company.id,
          role: CompanyMemberRole.company_admin,
          status: CompanyMemberStatus.active,
          joinedAt: new Date(),
        },
      },
    },
  });
  createdUserIds.push(builder.id);

  const otherBuilder = await prisma.db.user.create({
    data: {
      name: 'Other Builder',
      email: otherBuilderEmail,
      passwordHash,
      accountType: AccountType.company_member,
      status: UserStatus.active,
      companyMembership: {
        create: {
          companyId: otherCompany.id,
          role: CompanyMemberRole.company_admin,
          status: CompanyMemberStatus.active,
          joinedAt: new Date(),
        },
      },
    },
  });
  createdUserIds.push(otherBuilder.id);

  const project = await prisma.db.project.create({
    data: {
      builderCompanyId: company.id,
      name: `${CRM_FIXTURE_PREFIX}Project`,
      slug: `${CRM_FIXTURE_PREFIX}project-${Date.now()}`,
      publicationStatus: PublicationStatus.published,
      shortDescription: 'CRM e2e project',
    },
  });

  const building = await prisma.db.building.create({
    data: {
      projectId: project.id,
      name: 'A',
      publicationStatus: PublicationStatus.published,
    },
  });
  const floor = await prisma.db.floor.create({
    data: {
      buildingId: building.id,
      number: 1,
      publicationStatus: PublicationStatus.published,
    },
  });
  const apartment = await prisma.db.apartment.create({
    data: {
      projectId: project.id,
      buildingId: building.id,
      floorId: floor.id,
      number: '101',
      salesStatus: ApartmentSalesStatus.available,
      publicationStatus: PublicationStatus.published,
      price: 50_000_000,
      priceVisibility: PriceVisibility.public,
      crmStatusSource: CrmStatusSource.manual,
    },
  });

  const foreignProject = await prisma.db.project.create({
    data: {
      builderCompanyId: otherCompany.id,
      name: `${CRM_FIXTURE_PREFIX}ForeignProject`,
      slug: `${CRM_FIXTURE_PREFIX}foreign-${Date.now()}`,
      publicationStatus: PublicationStatus.published,
      shortDescription: 'Foreign CRM project',
    },
  });
  const foreignBuilding = await prisma.db.building.create({
    data: {
      projectId: foreignProject.id,
      name: 'B',
      publicationStatus: PublicationStatus.published,
    },
  });
  const foreignFloor = await prisma.db.floor.create({
    data: {
      buildingId: foreignBuilding.id,
      number: 1,
      publicationStatus: PublicationStatus.published,
    },
  });
  const foreignApartment = await prisma.db.apartment.create({
    data: {
      projectId: foreignProject.id,
      buildingId: foreignBuilding.id,
      floorId: foreignFloor.id,
      number: '201',
      salesStatus: ApartmentSalesStatus.available,
      publicationStatus: PublicationStatus.published,
      price: 40_000_000,
      priceVisibility: PriceVisibility.public,
      crmStatusSource: CrmStatusSource.manual,
    },
  });

  const qr = await prisma.db.qrCode.create({
    data: {
      buyerProfileId: buyer.buyerProfile!.id,
      tokenHash: `hash_${CRM_FIXTURE_PREFIX}${Date.now()}`,
      tokenEncrypted: 'encrypted-placeholder',
    },
  });

  const scan = await prisma.db.qrScanEvent.create({
    data: {
      qrCodeId: qr.id,
      buyerProfileId: buyer.buyerProfile!.id,
      scannerUserId: builder.id,
      scannerCompanyId: company.id,
      scannerRole: 'company_member',
      scanContext: QrScanContext.builder_scan,
      resultStatus: QrScanResultStatus.resolved,
    },
  });

  return {
    companyId: company.id,
    otherCompanyId: otherCompany.id,
    buyerEmail,
    otherBuyerEmail,
    builderEmail,
    otherBuilderEmail,
    buyerProfileId: buyer.buyerProfile!.id,
    projectId: project.id,
    apartmentId: apartment.id,
    foreignApartmentId: foreignApartment.id,
    qrCodeId: qr.id,
    scanEventId: scan.id,
    createdUserIds,
    createdCompanyIds,
  };
}

export async function cleanupCrmFixtures(
  prisma: PrismaService,
  createdCompanyIds: string[],
  createdUserIds: string[],
): Promise<void> {
  if (createdCompanyIds.length > 0) {
    await prisma.db.crmFollowUpActivity.deleteMany({
      where: { crmDeal: { companyId: { in: createdCompanyIds } } },
    });
    await prisma.db.crmNote.deleteMany({
      where: { crmDeal: { companyId: { in: createdCompanyIds } } },
    });
    await prisma.db.crmDealApartmentLink.deleteMany({
      where: { crmDeal: { companyId: { in: createdCompanyIds } } },
    });
    await prisma.db.crmDeal.updateMany({
      where: { companyId: { in: createdCompanyIds } },
      data: { primaryRequestId: null },
    });
    await prisma.db.request.deleteMany({
      where: { builderCompanyId: { in: createdCompanyIds } },
    });
    await prisma.db.crmDeal.deleteMany({
      where: { companyId: { in: createdCompanyIds } },
    });
    await prisma.db.project.deleteMany({
      where: { builderCompanyId: { in: createdCompanyIds } },
    });
    await prisma.db.company.deleteMany({
      where: { id: { in: createdCompanyIds } },
    });
  }
  if (createdUserIds.length > 0) {
    await prisma.db.user.deleteMany({
      where: { id: { in: createdUserIds } },
    });
  }
}
