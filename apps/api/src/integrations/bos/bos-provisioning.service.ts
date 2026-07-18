import { Injectable, Logger } from "@nestjs/common";
import type { BosProvisioningRequestBody, BosProvisioningResponse } from "@toonexpo/contracts";
import {
  AccountType,
  BosProvisioningStatus,
  CompanySource,
  CompanyStatus,
  CompanyType,
  UserStatus,
  Prisma,
} from "@toonexpo/db";

import { normalizeEmail } from "../../auth/mappers/user.mapper.js";
import { CompanyProvisioningService } from "../../company/provisioning/company-provisioning.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import {
  BOS_CROSS_COMPANY_MESSAGE,
  BOS_EMAIL_CONFLICT_MESSAGE,
  BOS_INVITE_RETRY_MESSAGE,
  BOS_TERMINAL_REPLAY_STATUSES,
} from "../integrations.constants.js";
import { BosProvisioningAuditService } from "./bos-provisioning-audit.service.js";
import { toBosProvisioningResponse } from "./bos-provisioning.mapper.js";

type BosProvisioningRecord = Prisma.BosProvisioningRequestGetPayload<object>;
type CompanyRecord = Prisma.CompanyGetPayload<object>;
type UserRecord = Prisma.UserGetPayload<object>;

type ProvisionOutcome = {
  company: CompanyRecord;
  user: UserRecord;
  companyCreated: boolean;
  userCreated: boolean;
  memberCreated: boolean;
  partnerCreated: boolean;
  invitationSent: boolean;
};

/**
 * Inbound BOS account provisioning with idempotency, partial retry, and audit.
 */
@Injectable()
export class BosProvisioningService {
  private readonly logger = new Logger(BosProvisioningService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly provisioning: CompanyProvisioningService,
    private readonly audit: BosProvisioningAuditService,
  ) {}

  async provision(body: BosProvisioningRequestBody): Promise<BosProvisioningResponse> {
    const email = normalizeEmail(body.primary_contact_email);
    const existing = await this.prisma.db.bosProvisioningRequest.findUnique({
      where: { requestId: body.request_id },
    });

    if (
      existing &&
      BOS_TERMINAL_REPLAY_STATUSES.includes(
        existing.status as (typeof BOS_TERMINAL_REPLAY_STATUSES)[number],
      )
    ) {
      return toBosProvisioningResponse(existing);
    }

    const record = existing
      ? await this.beginRetry(existing)
      : await this.createRequestRecord(body, email);

    const conflict = await this.detectEmailConflict(body.bos_company_id, email);
    if (conflict) {
      return this.fail(record.id, conflict);
    }

    try {
      const outcome = await this.executeProvisioning(record.id, body, email);
      const storedStatus = this.resolveStoredStatus(outcome);
      const updated = await this.persistOutcome(record.id, storedStatus, outcome);
      await this.audit.write(this.prisma.db, record.id, "result_returned", {
        status: storedStatus,
        requestedModules: body.requested_modules,
      });
      return toBosProvisioningResponse(updated);
    } catch (error) {
      const message =
        error instanceof Error && error.message === BOS_CROSS_COMPANY_MESSAGE
          ? BOS_CROSS_COMPANY_MESSAGE
          : "Provisioning failed; please retry";
      this.logger.error(
        { err: error, requestId: body.request_id },
        "BOS provisioning failed",
      );
      return this.fail(record.id, message);
    }
  }

  private async beginRetry(
    existing: BosProvisioningRecord,
  ): Promise<BosProvisioningRecord> {
    const updated = await this.prisma.db.bosProvisioningRequest.update({
      where: { id: existing.id },
      data: { attemptCount: { increment: 1 } },
    });
    await this.audit.write(this.prisma.db, existing.id, "provisioning_retried", {
      attemptCount: updated.attemptCount,
    });
    return updated;
  }

  private async createRequestRecord(
    body: BosProvisioningRequestBody,
    email: string,
  ): Promise<BosProvisioningRecord> {
    const record = await this.prisma.db.bosProvisioningRequest.create({
      data: {
        requestId: body.request_id,
        bosCompanyId: body.bos_company_id,
        companyName: body.company_name.trim(),
        companyType: body.company_type,
        primaryContactName: body.primary_contact_name.trim(),
        primaryContactEmail: email,
        primaryContactPhone: body.primary_contact_phone?.trim() || null,
        eventCycleId: body.event_cycle_id?.trim() || null,
        eventCycleName: body.event_cycle_name?.trim() || null,
        requestedModules: [...body.requested_modules],
        status: BosProvisioningStatus.failed,
      },
    });

    await this.audit.write(this.prisma.db, record.id, "provisioning_received", {
      bosCompanyId: body.bos_company_id,
      requestedModules: body.requested_modules,
    });

    return record;
  }

  private async detectEmailConflict(
    bosCompanyId: string,
    email: string,
  ): Promise<string | null> {
    const user = await this.provisioning.findUserWithMembership(email);
    if (!user?.companyMembership) {
      return null;
    }

    const linkedBosId = user.companyMembership.company.bosCompanyId;
    if (linkedBosId && linkedBosId !== bosCompanyId) {
      return BOS_EMAIL_CONFLICT_MESSAGE;
    }

    const companyByBos = await this.provisioning.findCompanyByBosId(bosCompanyId);
    if (companyByBos && user.companyMembership.companyId !== companyByBos.id) {
      return BOS_EMAIL_CONFLICT_MESSAGE;
    }

    if (!companyByBos) {
      return BOS_CROSS_COMPANY_MESSAGE;
    }

    return null;
  }

  private async executeProvisioning(
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

  private resolveStoredStatus(outcome: ProvisionOutcome): BosProvisioningStatus {
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

  private async persistOutcome(
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

  private async fail(
    recordId: string,
    message: string,
  ): Promise<BosProvisioningResponse> {
    const updated = await this.prisma.db.bosProvisioningRequest.update({
      where: { id: recordId },
      data: {
        status: BosProvisioningStatus.failed,
        errorMessage: message,
      },
    });

    await this.audit.write(this.prisma.db, recordId, "provisioning_failed", {
      message,
    });
    await this.audit.write(this.prisma.db, recordId, "result_returned", {
      status: BosProvisioningStatus.failed,
    });

    return toBosProvisioningResponse(updated);
  }
}
