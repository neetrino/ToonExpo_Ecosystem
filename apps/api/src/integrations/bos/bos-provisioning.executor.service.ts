import { Injectable, Logger } from "@nestjs/common";
import type { BosProvisioningRequestBody } from "@toonexpo/contracts";
import {
  AccountType,
  BosProvisioningStatus,
  CompanySource,
  CompanyStatus,
  CompanyType,
  UserStatus,
} from "@toonexpo/db";

import { CompanyProvisioningService } from "../../company/provisioning/company-provisioning.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import {
  BOS_CROSS_COMPANY_MESSAGE,
  BOS_INVITE_RETRY_MESSAGE,
} from "../integrations.constants.js";
import { BosProvisioningAuditService } from "./bos-provisioning-audit.service.js";
import type {
  BosProvisioningRecord,
  ProvisionOutcome,
  UserRecord,
} from "./bos-provisioning.types.js";

/**
 * Transactional BOS provisioning steps: entity creation, membership, invites.
 */
@Injectable()
export class BosProvisioningExecutorService {
  private readonly logger = new Logger(BosProvisioningExecutorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly provisioning: CompanyProvisioningService,
    private readonly audit: BosProvisioningAuditService,
  ) {}

  async execute(
    recordId: string,
    body: BosProvisioningRequestBody,
    email: string,
  ): Promise<ProvisionOutcome> {
    const companyType = body.company_type as CompanyType;
    let companyCreated = false;
    let userCreated = false;
    let memberCreated = false;
    let partnerCreated = false;

    const txResult = await this.prisma.db.$transaction(async (tx) => {
      let company = await tx.company.findUnique({
        where: { bosCompanyId: body.bos_company_id },
      });

      if (!company) {
        company = await tx.company.create({
          data: {
            name: body.company_name.trim(),
            type: companyType,
            status: CompanyStatus.active,
            source: CompanySource.bos,
            bosCompanyId: body.bos_company_id,
          },
        });
        companyCreated = true;
      }

      let user = await tx.user.findUnique({ where: { email } });
      if (!user) {
        user = await tx.user.create({
          data: {
            name: body.primary_contact_name.trim(),
            email,
            phone: body.primary_contact_phone?.trim() || null,
            accountType: AccountType.company_member,
            status: UserStatus.invited,
          },
        });
        userCreated = true;
      }

      const membership = await tx.companyMember.findUnique({
        where: { userId: user.id },
      });
      if (membership && membership.companyId !== company.id) {
        throw new Error(BOS_CROSS_COMPANY_MESSAGE);
      }

      const memberResult = await this.provisioning.ensureCompanyAdminMembership(
        tx,
        company.id,
        user.id,
      );
      memberCreated = memberResult.created;

      const partnerResult = await this.provisioning.ensureDraftPartnerProfile(
        tx,
        company.id,
        company.name,
        companyType,
      );
      partnerCreated = partnerResult.created;

      return { company, user };
    });

    await this.audit.write(
      this.prisma.db,
      recordId,
      companyCreated ? "company_created" : "company_linked",
      { companyId: txResult.company.id },
    );
    await this.audit.write(
      this.prisma.db,
      recordId,
      userCreated ? "user_created" : "user_linked",
      { userId: txResult.user.id },
    );
    if (memberCreated) {
      await this.audit.write(this.prisma.db, recordId, "member_created", {
        userId: txResult.user.id,
        companyId: txResult.company.id,
      });
    }

    const invitationSent = await this.sendInvitationIfNeeded(
      recordId,
      txResult.user,
      body.request_id,
    );

    return {
      company: txResult.company,
      user: txResult.user,
      companyCreated,
      userCreated,
      memberCreated,
      partnerCreated,
      invitationSent,
    };
  }

  resolveStoredStatus(outcome: ProvisionOutcome): BosProvisioningStatus {
    const needsInvite =
      outcome.user.status !== UserStatus.active || !outcome.user.passwordHash;

    if (needsInvite && !outcome.invitationSent) {
      return BosProvisioningStatus.partial;
    }

    const created =
      outcome.companyCreated ||
      outcome.userCreated ||
      outcome.memberCreated ||
      outcome.partnerCreated;

    if (created || outcome.invitationSent) {
      return BosProvisioningStatus.success;
    }

    return BosProvisioningStatus.linked_existing;
  }

  async persistOutcome(
    recordId: string,
    status: BosProvisioningStatus,
    outcome: ProvisionOutcome,
  ): Promise<BosProvisioningRecord> {
    const errorMessage =
      status === BosProvisioningStatus.partial ? BOS_INVITE_RETRY_MESSAGE : null;

    return this.prisma.db.bosProvisioningRequest.update({
      where: { id: recordId },
      data: {
        status,
        toonexpoCompanyId: outcome.company.id,
        primaryUserId: outcome.user.id,
        errorMessage,
      },
    });
  }

  private async sendInvitationIfNeeded(
    recordId: string,
    user: UserRecord,
    requestId: string,
  ): Promise<boolean> {
    if (user.status === UserStatus.active && user.passwordHash) {
      return false;
    }

    try {
      await this.provisioning.sendSetPasswordInvite({
        userId: user.id,
        email: user.email,
        name: user.name,
      });
      await this.audit.write(this.prisma.db, recordId, "invitation_sent", {
        userId: user.id,
      });
      return true;
    } catch (error) {
      this.logger.error(
        { err: error, requestId, userId: user.id },
        "BOS invitation email failed",
      );
      return false;
    }
  }
}
