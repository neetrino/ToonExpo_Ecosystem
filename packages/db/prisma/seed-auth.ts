/**
 * Auth account seed helpers (platform_admin + company_admin + seed buyer with QR).
 */
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
} from "../src/index.js";
import { SEED_BUILDERS, SEED_ID_PREFIX } from "./seed-data.js";

/** Dev-only fallback when SEED_ADMIN_PASSWORD is unset. Never use in production. */
export const DEV_SEED_ADMIN_PASSWORD = "ChangeMeAdmin123!";

export const SEED_PLATFORM_ADMIN_EMAIL = "admin@toonexpo.local";

export const SEED_COMPANY_ADMIN_EMAIL = "builder.admin@toonexpo.local";

export const SEED_BUYER_EMAIL = "buyer@toonexpo.local";

export const SEED_PLATFORM_ADMIN_ID = `${SEED_ID_PREFIX}user_platform_admin`;

export const SEED_COMPANY_ADMIN_ID = `${SEED_ID_PREFIX}user_company_admin`;

export const SEED_BUYER_ID = `${SEED_ID_PREFIX}user_buyer`;

export const SEED_BUYER_PROFILE_ID = `${SEED_ID_PREFIX}buyer_profile`;

export const SEED_BUYER_QR_ID = `${SEED_ID_PREFIX}qr_buyer`;

export const SEED_COMPANY_MEMBER_ID = `${SEED_ID_PREFIX}member_company_admin`;

const resolveSeedPassword = (): string => {
  const fromEnv = process.env["SEED_ADMIN_PASSWORD"]?.trim();
  if (fromEnv && fromEnv.length >= 8) {
    return fromEnv;
  }
  return DEV_SEED_ADMIN_PASSWORD;
};

const resolveQrPepper = (): string => {
  const pepper = process.env["SESSION_TOKEN_PEPPER"]?.trim();
  if (!pepper || pepper.length < 32) {
    throw new Error(
      "SESSION_TOKEN_PEPPER (≥32 chars) is required to seed buyer QR codes",
    );
  }
  return pepper;
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

  await prisma.user.upsert({
    where: { email: SEED_PLATFORM_ADMIN_EMAIL },
    create: {
      id: SEED_PLATFORM_ADMIN_ID,
      name: "Platform Admin",
      email: SEED_PLATFORM_ADMIN_EMAIL,
      passwordHash,
      accountType: AccountType.platform_admin,
      status: UserStatus.active,
    },
    update: {
      passwordHash,
      accountType: AccountType.platform_admin,
      status: UserStatus.active,
    },
  });

  await prisma.user.upsert({
    where: { email: SEED_COMPANY_ADMIN_EMAIL },
    create: {
      id: SEED_COMPANY_ADMIN_ID,
      name: "Seed Builder Admin",
      email: SEED_COMPANY_ADMIN_EMAIL,
      passwordHash,
      accountType: AccountType.company_member,
      status: UserStatus.active,
      companyMembership: {
        create: {
          id: SEED_COMPANY_MEMBER_ID,
          companyId: builderCompanyId,
          role: CompanyMemberRole.company_admin,
          status: CompanyMemberStatus.active,
          joinedAt: new Date(),
        },
      },
    },
    update: {
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
  await prisma.user.upsert({
    where: { email: SEED_BUYER_EMAIL },
    create: {
      id: SEED_BUYER_ID,
      name: "Seed Buyer",
      email: SEED_BUYER_EMAIL,
      phone: "+37491110000",
      passwordHash,
      accountType: AccountType.buyer,
      status: UserStatus.active,
      buyerProfile: {
        create: {
          id: SEED_BUYER_PROFILE_ID,
          name: "Seed Buyer",
          phone: "+37491110000",
          email: SEED_BUYER_EMAIL,
        },
      },
    },
    update: {
      passwordHash,
      accountType: AccountType.buyer,
      status: UserStatus.active,
      phone: "+37491110000",
    },
  });

  const profile = await prisma.buyerProfile.upsert({
    where: { userId: SEED_BUYER_ID },
    create: {
      id: SEED_BUYER_PROFILE_ID,
      userId: SEED_BUYER_ID,
      name: "Seed Buyer",
      phone: "+37491110000",
      email: SEED_BUYER_EMAIL,
    },
    update: {
      name: "Seed Buyer",
      phone: "+37491110000",
      email: SEED_BUYER_EMAIL,
    },
  });

  const existingQr = await prisma.qrCode.findUnique({
    where: { buyerProfileId: profile.id },
  });

  if (existingQr) {
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

/**
 * Removes seed auth users (and cascading memberships/sessions/tokens/QR).
 */
export const clearSeedAuthAccounts = async (
  prisma: PrismaClient,
): Promise<void> => {
  await prisma.user.deleteMany({
    where: {
      OR: [
        {
          id: {
            in: [SEED_PLATFORM_ADMIN_ID, SEED_COMPANY_ADMIN_ID, SEED_BUYER_ID],
          },
        },
        {
          email: {
            in: [
              SEED_PLATFORM_ADMIN_EMAIL,
              SEED_COMPANY_ADMIN_EMAIL,
              SEED_BUYER_EMAIL,
            ],
          },
        },
      ],
    },
  });
};
