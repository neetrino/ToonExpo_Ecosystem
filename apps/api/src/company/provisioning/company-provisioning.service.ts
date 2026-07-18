import {
  ConflictException,
  Injectable,
} from "@nestjs/common";
import {
  AccountType,
  CompanyMemberRole,
  CompanyMemberStatus,
  CompanySource,
  CompanyStatus,
  CompanyType,
  PartnerCompanyStatus,
  PartnerCompanyType,
  PublicationStatus,
  UserStatus,
  Prisma,
} from "@toonexpo/db";

import { InviteMailerService } from "../../access-tokens/invite-mailer.service.js";
import { normalizeEmail } from "../../auth/mappers/user.mapper.js";
import { buildProjectSlug } from "../../portal/utils/slug.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { isPartnerCompatibleType } from "../../partners/utils/partner-access.js";

type CompanyRecord = Prisma.CompanyGetPayload<object>;
type UserRecord = Prisma.UserGetPayload<object>;

type CompanyAdminTransactionInput = {
  companyName: string;
  companyType: CompanyType;
  companyDescription?: string | null;
  source: CompanySource;
  bosCompanyId?: string | null;
  adminName: string;
  adminEmail: string;
  adminPhone?: string | null;
};

type DbClient = PrismaService["db"] | Prisma.TransactionClient;

/**
 * Shared company + primary-admin provisioning used by platform admin and BOS.
 */
@Injectable()
export class CompanyProvisioningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inviteMailer: InviteMailerService,
  ) {}

  async assertEmailAvailable(email: string): Promise<void> {
    const existing = await this.prisma.db.user.findUnique({
      where: { email: normalizeEmail(email) },
    });
    if (existing) {
      throw new ConflictException("Email is already registered");
    }
  }

  async createCompanyWithPrimaryAdmin(
    input: CompanyAdminTransactionInput,
  ): Promise<{ company: CompanyRecord; adminUser: UserRecord }> {
    return this.prisma.db.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: input.companyName,
          type: input.companyType,
          description: input.companyDescription ?? null,
          status: CompanyStatus.active,
          source: input.source,
          ...(input.bosCompanyId ? { bosCompanyId: input.bosCompanyId } : {}),
        },
      });

      const adminUser = await tx.user.create({
        data: {
          name: input.adminName,
          email: input.adminEmail,
          phone: input.adminPhone ?? null,
          accountType: AccountType.company_member,
          status: UserStatus.invited,
          companyMembership: {
            create: {
              companyId: company.id,
              role: CompanyMemberRole.company_admin,
              status: CompanyMemberStatus.active,
            },
          },
        },
      });

      return { company, adminUser };
    });
  }

  async sendSetPasswordInvite(input: {
    userId: string;
    email: string;
    name: string;
    locale?: string;
  }): Promise<void> {
    await this.inviteMailer.sendSetPasswordInvite(input);
  }

  async findCompanyByBosId(bosCompanyId: string): Promise<CompanyRecord | null> {
    return this.prisma.db.company.findUnique({ where: { bosCompanyId } });
  }

  async findUserWithMembership(email: string): Promise<
    | (UserRecord & {
        companyMembership: {
          companyId: string;
          company: Pick<CompanyRecord, "id" | "bosCompanyId">;
        } | null;
      })
    | null
  > {
    return this.prisma.db.user.findUnique({
      where: { email: normalizeEmail(email) },
      include: {
        companyMembership: {
          include: {
            company: {
              select: { id: true, bosCompanyId: true },
            },
          },
        },
      },
    });
  }

  async ensureCompanyAdminMembership(
    db: DbClient,
    companyId: string,
    userId: string,
  ): Promise<{ created: boolean }> {
    const existing = await db.companyMember.findUnique({ where: { userId } });
    if (existing) {
      return { created: false };
    }

    await db.companyMember.create({
      data: {
        companyId,
        userId,
        role: CompanyMemberRole.company_admin,
        status: CompanyMemberStatus.active,
      },
    });

    return { created: true };
  }

  async ensureDraftPartnerProfile(
    db: DbClient,
    companyId: string,
    companyName: string,
    companyType: CompanyType,
  ): Promise<{ created: boolean }> {
    if (!isPartnerCompatibleType(companyType)) {
      return { created: false };
    }

    const existing = await db.partnerCompany.findUnique({ where: { companyId } });
    if (existing) {
      return { created: false };
    }

    const partnerType =
      companyType === CompanyType.bank
        ? PartnerCompanyType.bank
        : PartnerCompanyType.other;

    await db.partnerCompany.create({
      data: {
        companyId,
        type: partnerType,
        name: companyName,
        slug: await this.resolveUniquePartnerSlug(db, companyName),
        status: PartnerCompanyStatus.active,
        publicationStatus: PublicationStatus.draft,
      },
    });

    return { created: true };
  }

  private async resolveUniquePartnerSlug(
    db: DbClient,
    name: string,
  ): Promise<string> {
    let candidate = buildProjectSlug(name);
    let attempt = 0;

    while (await db.partnerCompany.findUnique({ where: { slug: candidate } })) {
      attempt += 1;
      candidate = buildProjectSlug(`${name}-${attempt}`);
      if (attempt > 20) {
        throw new ConflictException("Unable to generate a unique partner slug");
      }
    }

    return candidate;
  }
}
