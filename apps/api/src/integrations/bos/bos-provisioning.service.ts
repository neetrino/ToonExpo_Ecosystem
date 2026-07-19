import { Injectable, Logger } from "@nestjs/common";
import type { BosProvisioningRequestBody, BosProvisioningResponse } from "@toonexpo/contracts";
import { BosProvisioningStatus } from "@toonexpo/db";

import { normalizeEmail } from "../../auth/mappers/user.mapper.js";
import { CompanyProvisioningService } from "../../company/provisioning/company-provisioning.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import {
  BOS_CROSS_COMPANY_MESSAGE,
  BOS_EMAIL_CONFLICT_MESSAGE,
  BOS_TERMINAL_REPLAY_STATUSES,
} from "../integrations.constants.js";
import { BosProvisioningAuditService } from "./bos-provisioning-audit.service.js";
import { BosProvisioningExecutorService } from "./bos-provisioning.executor.service.js";
import { toBosProvisioningResponse } from "./bos-provisioning.mapper.js";
import type { BosProvisioningRecord } from "./bos-provisioning.types.js";

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
    private readonly executor: BosProvisioningExecutorService,
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
      const outcome = await this.executor.execute(record.id, body, email);
      const storedStatus = this.executor.resolveStoredStatus(outcome);
      const updated = await this.executor.persistOutcome(
        record.id,
        storedStatus,
        outcome,
      );
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
