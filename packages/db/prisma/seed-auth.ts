/**
 * Auth account seed helpers (platform_admin + company_admin for portal testing).
 */
import {
  AccountType,
  CompanyMemberRole,
  CompanyMemberStatus,
  UserStatus,
  type PrismaClient,
} from "../src/index.js";
import { SEED_BUILDERS, SEED_ID_PREFIX } from "./seed-data.js";

/** Dev-only fallback when SEED_ADMIN_PASSWORD is unset. Never use in production. */
export const DEV_SEED_ADMIN_PASSWORD = "ChangeMeAdmin123!";

export const SEED_PLATFORM_ADMIN_EMAIL = "admin@toonexpo.local";

export const SEED_COMPANY_ADMIN_EMAIL = "builder.admin@toonexpo.local";

export const SEED_PLATFORM_ADMIN_ID = `${SEED_ID_PREFIX}user_platform_admin`;

export const SEED_COMPANY_ADMIN_ID = `${SEED_ID_PREFIX}user_company_admin`;

export const SEED_COMPANY_MEMBER_ID = `${SEED_ID_PREFIX}member_company_admin`;

const resolveSeedPassword = (): string => {
  const fromEnv = process.env["SEED_ADMIN_PASSWORD"]?.trim();
  if (fromEnv && fromEnv.length >= 8) {
    return fromEnv;
  }
  return DEV_SEED_ADMIN_PASSWORD;
};

/**
 * Upserts platform_admin and an active company_admin on the first seed builder.
 */
export const seedAuthAccounts = async (
  prisma: PrismaClient,
  hashPassword: (password: string) => Promise<string>,
): Promise<void> => {
  const passwordHash = await hashPassword(resolveSeedPassword());
  const builderCompanyId = SEED_BUILDERS[0]!.id;

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
};

/**
 * Removes seed auth users (and cascading memberships/sessions/tokens).
 */
export const clearSeedAuthAccounts = async (
  prisma: PrismaClient,
): Promise<void> => {
  await prisma.user.deleteMany({
    where: {
      OR: [
        { id: { in: [SEED_PLATFORM_ADMIN_ID, SEED_COMPANY_ADMIN_ID] } },
        {
          email: {
            in: [SEED_PLATFORM_ADMIN_EMAIL, SEED_COMPANY_ADMIN_EMAIL],
          },
        },
      ],
    },
  });
};
