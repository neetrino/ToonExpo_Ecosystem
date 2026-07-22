/**
 * Auth account seed helpers (platform_admin + company_admin + seed buyer with QR).
 * Upserts by stable seed IDs so exhibition/visual-map FKs never drift on dirty DBs.
 */
import {
  DEV_SEED_ADMIN_PASSWORD,
  SEED_BUYER_EMAIL,
  SEED_BUYER_ID,
  SEED_BUYER_PROFILE_ID,
  SEED_BUYER_QR_ID,
  SEED_COMPANY_ADMIN_EMAIL,
  SEED_COMPANY_ADMIN_ID,
  SEED_COMPANY_MEMBER_ID,
  SEED_PLATFORM_ADMIN_EMAIL,
  SEED_PLATFORM_ADMIN_ID,
} from '@toonexpo/shared';

import {
  AccountType,
  CompanyMemberRole,
  CompanyMemberStatus,
  QrCodeStatus,
  UserStatus,
  createQrToken,
  encryptQrToken,
  hashQrToken,
  type PrismaClient,
} from '../src/index.js';
import { SEED_BUILDERS } from './seed-data.js';

export {
  DEV_SEED_ADMIN_PASSWORD,
  SEED_BUYER_EMAIL,
  SEED_BUYER_ID,
  SEED_BUYER_PROFILE_ID,
  SEED_BUYER_QR_ID,
  SEED_COMPANY_ADMIN_EMAIL,
  SEED_COMPANY_ADMIN_ID,
  SEED_COMPANY_MEMBER_ID,
  SEED_PLATFORM_ADMIN_EMAIL,
  SEED_PLATFORM_ADMIN_ID,
};

const resolveSeedPassword = (): string => {
  const fromEnv = process.env['SEED_ADMIN_PASSWORD']?.trim();
  if (fromEnv && fromEnv.length >= 8) {
    return fromEnv;
  }
  return DEV_SEED_ADMIN_PASSWORD;
};

const resolveQrPepper = (): string => {
  const pepper = process.env['SESSION_TOKEN_PEPPER']?.trim();
  if (!pepper || pepper.length < 32) {
    throw new Error('SESSION_TOKEN_PEPPER (≥32 chars) is required to seed buyer QR codes');
  }
  return pepper;
};

/**
 * Frees a seed email held by a non-stable user id so upsert-by-id can claim it.
 */
const freeSeedEmailIfWrongId = async (
  prisma: PrismaClient,
  email: string,
  expectedId: string,
): Promise<void> => {
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!existing || existing.id === expectedId) {
    return;
  }

  await prisma.session.deleteMany({ where: { userId: existing.id } });
  await prisma.user.update({
    where: { id: existing.id },
    data: { email: `orphaned.${existing.id}@toonexpo.invalid` },
  });

  try {
    await prisma.user.delete({ where: { id: existing.id } });
  } catch {
    console.warn(
      `[seed] Left orphaned user ${existing.id} (FK references); email freed for ${expectedId}`,
    );
  }
};

/**
 * Upserts platform_admin, company_admin on the first seed builder, and a seed buyer with QR.
 */
export const seedAuthAccounts = async (
  prisma: PrismaClient,
  hashPassword: (password: string) => Promise<string>,
): Promise<void> => {
  const passwordHash = await hashPassword(resolveSeedPassword());
  const builderCompanyId = SEED_BUILDERS[0]!.id;
  const pepper = resolveQrPepper();

  await freeSeedEmailIfWrongId(prisma, SEED_PLATFORM_ADMIN_EMAIL, SEED_PLATFORM_ADMIN_ID);
  await prisma.user.upsert({
    where: { id: SEED_PLATFORM_ADMIN_ID },
    create: {
      id: SEED_PLATFORM_ADMIN_ID,
      name: 'Platform Admin',
      email: SEED_PLATFORM_ADMIN_EMAIL,
      passwordHash,
      accountType: AccountType.platform_admin,
      status: UserStatus.active,
    },
    update: {
      email: SEED_PLATFORM_ADMIN_EMAIL,
      passwordHash,
      accountType: AccountType.platform_admin,
      status: UserStatus.active,
    },
  });

  await freeSeedEmailIfWrongId(prisma, SEED_COMPANY_ADMIN_EMAIL, SEED_COMPANY_ADMIN_ID);
  await prisma.user.upsert({
    where: { id: SEED_COMPANY_ADMIN_ID },
    create: {
      id: SEED_COMPANY_ADMIN_ID,
      name: 'Seed Builder Admin',
      email: SEED_COMPANY_ADMIN_EMAIL,
      passwordHash,
      accountType: AccountType.company_member,
      status: UserStatus.active,
    },
    update: {
      email: SEED_COMPANY_ADMIN_EMAIL,
      passwordHash,
      accountType: AccountType.company_member,
      status: UserStatus.active,
    },
  });

  await prisma.companyMember.upsert({
    where: { userId: SEED_COMPANY_ADMIN_ID },
    create: {
      id: SEED_COMPANY_MEMBER_ID,
      companyId: builderCompanyId,
      userId: SEED_COMPANY_ADMIN_ID,
      role: CompanyMemberRole.company_admin,
      status: CompanyMemberStatus.active,
      joinedAt: new Date(),
    },
    update: {
      companyId: builderCompanyId,
      role: CompanyMemberRole.company_admin,
      status: CompanyMemberStatus.active,
    },
  });

  await seedBuyerWithQr(prisma, passwordHash, pepper);
};

const seedBuyerWithQr = async (
  prisma: PrismaClient,
  passwordHash: string,
  pepper: string,
): Promise<void> => {
  await freeSeedEmailIfWrongId(prisma, SEED_BUYER_EMAIL, SEED_BUYER_ID);
  await prisma.user.upsert({
    where: { id: SEED_BUYER_ID },
    create: {
      id: SEED_BUYER_ID,
      name: 'Seed Buyer',
      email: SEED_BUYER_EMAIL,
      phone: '+37491110000',
      passwordHash,
      accountType: AccountType.buyer,
      status: UserStatus.active,
      buyerProfile: {
        create: {
          id: SEED_BUYER_PROFILE_ID,
          name: 'Seed Buyer',
          phone: '+37491110000',
          email: SEED_BUYER_EMAIL,
        },
      },
    },
    update: {
      email: SEED_BUYER_EMAIL,
      passwordHash,
      accountType: AccountType.buyer,
      status: UserStatus.active,
      phone: '+37491110000',
    },
  });

  const profile = await prisma.buyerProfile.upsert({
    where: { userId: SEED_BUYER_ID },
    create: {
      id: SEED_BUYER_PROFILE_ID,
      userId: SEED_BUYER_ID,
      name: 'Seed Buyer',
      phone: '+37491110000',
      email: SEED_BUYER_EMAIL,
    },
    update: {
      name: 'Seed Buyer',
      phone: '+37491110000',
      email: SEED_BUYER_EMAIL,
    },
  });

  const existingQr = await prisma.qrCode.findUnique({
    where: { buyerProfileId: profile.id },
  });

  if (existingQr) {
    await prisma.qrCode.update({
      where: { id: existingQr.id },
      data: { status: QrCodeStatus.active },
    });
    return;
  }

  const token = createQrToken();
  await prisma.qrCode.create({
    data: {
      id: SEED_BUYER_QR_ID,
      buyerProfileId: profile.id,
      tokenHash: hashQrToken(token, pepper),
      tokenEncrypted: encryptQrToken(token, pepper),
      status: QrCodeStatus.active,
    },
  });
};
