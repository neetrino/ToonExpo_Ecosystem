import {
  AccountType,
  CompanyMemberRole,
  CompanyMemberStatus,
  CompanySource,
  CompanyStatus,
  CompanyType,
  UserStatus,
} from '@toonexpo/db';

import { hashPassword } from '../src/auth/utils/password.util.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { uniqueEmail } from './helpers/e2e-http.js';

export const PORTAL_FIXTURE_PREFIX = 'e2e_portal_';
export const PORTAL_E2E_PASSWORD = 'portal-e2e-pass-123';

export type PortalFixtureIds = {
  companyAId: string;
  companyBId: string;
  adminAEmail: string;
  memberAEmail: string;
  adminBEmail: string;
  createdUserIds: string[];
  createdCompanyIds: string[];
};

export async function seedPortalFixtures(
  prisma: PrismaService,
  password: string,
): Promise<PortalFixtureIds> {
  const passwordHash = await hashPassword(password);
  const createdUserIds: string[] = [];
  const createdCompanyIds: string[] = [];

  const companyA = await prisma.db.company.create({
    data: {
      name: `${PORTAL_FIXTURE_PREFIX}Company A`,
      type: CompanyType.builder,
      status: CompanyStatus.active,
      source: CompanySource.admin,
    },
  });
  createdCompanyIds.push(companyA.id);

  const companyB = await prisma.db.company.create({
    data: {
      name: `${PORTAL_FIXTURE_PREFIX}Company B`,
      type: CompanyType.builder,
      status: CompanyStatus.active,
      source: CompanySource.admin,
    },
  });
  createdCompanyIds.push(companyB.id);

  const adminAEmail = uniqueEmail(PORTAL_FIXTURE_PREFIX, 'admin-a');
  const memberAEmail = uniqueEmail(PORTAL_FIXTURE_PREFIX, 'member-a');
  const adminBEmail = uniqueEmail(PORTAL_FIXTURE_PREFIX, 'admin-b');

  const adminA = await prisma.db.user.create({
    data: {
      name: 'Portal Admin A',
      email: adminAEmail,
      passwordHash,
      accountType: AccountType.company_member,
      status: UserStatus.active,
      companyMembership: {
        create: {
          companyId: companyA.id,
          role: CompanyMemberRole.company_admin,
          status: CompanyMemberStatus.active,
          joinedAt: new Date(),
        },
      },
    },
  });
  createdUserIds.push(adminA.id);

  const memberA = await prisma.db.user.create({
    data: {
      name: 'Portal Member A',
      email: memberAEmail,
      passwordHash,
      accountType: AccountType.company_member,
      status: UserStatus.active,
      companyMembership: {
        create: {
          companyId: companyA.id,
          role: CompanyMemberRole.member,
          status: CompanyMemberStatus.active,
          joinedAt: new Date(),
        },
      },
    },
  });
  createdUserIds.push(memberA.id);

  const adminB = await prisma.db.user.create({
    data: {
      name: 'Portal Admin B',
      email: adminBEmail,
      passwordHash,
      accountType: AccountType.company_member,
      status: UserStatus.active,
      companyMembership: {
        create: {
          companyId: companyB.id,
          role: CompanyMemberRole.company_admin,
          status: CompanyMemberStatus.active,
          joinedAt: new Date(),
        },
      },
    },
  });
  createdUserIds.push(adminB.id);

  return {
    companyAId: companyA.id,
    companyBId: companyB.id,
    adminAEmail,
    memberAEmail,
    adminBEmail,
    createdUserIds,
    createdCompanyIds,
  };
}

export async function cleanupPortalFixtures(
  prisma: PrismaService,
  createdProjectIds: string[],
  createdCompanyIds: string[],
  createdUserIds: string[],
): Promise<void> {
  if (createdProjectIds.length > 0) {
    await prisma.db.project.deleteMany({
      where: { id: { in: createdProjectIds } },
    });
  }
  if (createdCompanyIds.length > 0) {
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
