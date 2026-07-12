import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  bosProvisioningRequestSchema,
  type BosProvisioningRequest,
  type BosProvisioningResponse,
} from '@toonexpo/contracts';
import type { Prisma } from '@toonexpo/db';

import { PrismaService } from '../../../common/prisma.service';

import {
  ensurePartner,
  mapRole,
  needsPartnerProfile,
  resolveCompanyId,
} from './bos-provisioning.accounts';
import {
  extractRequestId,
  logProvisioningFailure,
  markFailedIfProcessing,
  toBosAuditPayload,
  writeBosIntegrationAuditBestEffort,
} from './bos-provisioning.audit';
import {
  EMAIL_CONFLICT_ERROR_MESSAGE,
  PROVISIONING_CLAIM_STATUS,
  PROVISIONING_IN_PROGRESS_CODE,
} from './bos-provisioning.constants';
import { hashUnusablePassword } from './bos-provisioning.crypto';
import {
  buildFailedResponse,
  createProcessingClaim,
  isEmailConflictSnapshot,
  isEmailUniqueViolation,
  isRequestIdUniqueViolation,
  isTerminalProvisioningStatus,
  toReplayResponse,
  tryLinkedExisting,
  writeClaimSnapshot,
  type ClaimTxResult,
} from './bos-provisioning.idempotency';

export type ProvisionOutcome =
  | { kind: 'created'; response: BosProvisioningResponse; httpStatus: 201 }
  | { kind: 'linked'; response: BosProvisioningResponse; httpStatus: 200 }
  | { kind: 'idempotent'; response: BosProvisioningResponse; httpStatus: 200 }
  | { kind: 'failed'; response: BosProvisioningResponse; httpStatus: 200 }
  | { kind: 'busy'; httpStatus: 409 }
  | { kind: 'validation'; issues: Array<{ path: string; message: string }> };

@Injectable()
export class BosProvisioningService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async provision(rawBody: unknown): Promise<ProvisionOutcome> {
    const parsed = bosProvisioningRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return this.handleValidationFailure(rawBody, parsed.error.issues);
    }

    const input = parsed.data;
    await writeBosIntegrationAuditBestEffort(this.prisma.client, {
      requestId: input.requestId,
      status: 'RECEIVED',
      message: 'provisioning request received',
      payload: toBosAuditPayload(input),
    });

    return this.executeProvisioning(input);
  }

  private async handleValidationFailure(
    rawBody: unknown,
    zodIssues: Array<{ path: (string | number)[]; message: string }>,
  ): Promise<ProvisionOutcome> {
    const issues = zodIssues.map((issue) => ({
      path: issue.path.join('.') || '(root)',
      message: issue.message,
    }));
    await writeBosIntegrationAuditBestEffort(this.prisma.client, {
      requestId: extractRequestId(rawBody),
      status: 'FAILED',
      message: 'VALIDATION_ERROR',
      payload: { issueCount: issues.length },
    });
    return { kind: 'validation', issues };
  }

  private async executeProvisioning(input: BosProvisioningRequest): Promise<ProvisionOutcome> {
    const passwordHash = await hashUnusablePassword();
    try {
      const result = await this.prisma.client.$transaction((tx) =>
        this.runClaimedProvision(tx, input, passwordHash),
      );
      return this.finalizeClaimResult(input, result);
    } catch (error) {
      if (isRequestIdUniqueViolation(error)) {
        return this.replayAfterClaimConflict(input.requestId);
      }
      return this.handleProvisioningError(input, error);
    }
  }

  private async runClaimedProvision(
    tx: Prisma.TransactionClient,
    input: BosProvisioningRequest,
    passwordHash: string,
  ): Promise<ClaimTxResult> {
    await createProcessingClaim(tx, input);

    const email = input.primaryContactEmail.toLowerCase();
    const existingUser = await tx.user.findUnique({ where: { email } });
    if (existingUser) {
      const linked = await tryLinkedExisting(tx, input, existingUser);
      if (linked) {
        await writeClaimSnapshot(tx, input.requestId, linked);
        return { kind: 'linked', response: linked };
      }
      const failed = buildFailedResponse(input.requestId, EMAIL_CONFLICT_ERROR_MESSAGE);
      await writeClaimSnapshot(tx, input.requestId, failed);
      return { kind: 'email_conflict', response: failed };
    }

    const response = await this.createAccountsInTx(tx, input, email, passwordHash);
    await writeClaimSnapshot(tx, input.requestId, response);
    return { kind: 'success', response };
  }

  private async finalizeClaimResult(
    input: BosProvisioningRequest,
    result: ClaimTxResult,
  ): Promise<ProvisionOutcome> {
    if (result.kind === 'email_conflict') {
      await writeBosIntegrationAuditBestEffort(this.prisma.client, {
        requestId: input.requestId,
        status: 'FAILED',
        message: 'EMAIL_CONFLICT',
        payload: toBosAuditPayload(input),
      });
      throw new ConflictException({
        code: 'EMAIL_CONFLICT',
        message: 'Primary contact email is already registered',
      });
    }

    await writeBosIntegrationAuditBestEffort(this.prisma.client, {
      requestId: input.requestId,
      status: 'SUCCEEDED',
      message: result.kind === 'linked' ? 'linked existing account' : 'account provisioned',
      payload: {
        toonexpoCompanyId: result.response.toonexpoCompanyId,
        primaryUserId: result.response.primaryUserId,
        status: result.response.status,
      },
    });

    if (result.kind === 'linked') {
      return { kind: 'linked', response: result.response, httpStatus: 200 };
    }
    return { kind: 'created', response: result.response, httpStatus: 201 };
  }

  private async replayAfterClaimConflict(requestId: string): Promise<ProvisionOutcome> {
    const existing = await this.prisma.client.provisioningRequest.findUnique({
      where: { requestId },
    });

    if (!existing || existing.status === PROVISIONING_CLAIM_STATUS) {
      await writeBosIntegrationAuditBestEffort(this.prisma.client, {
        requestId,
        status: 'FAILED',
        message: PROVISIONING_IN_PROGRESS_CODE,
        payload: { reason: 'claim_busy' },
      });
      return { kind: 'busy', httpStatus: 409 };
    }

    if (!isTerminalProvisioningStatus(existing.status)) {
      return { kind: 'busy', httpStatus: 409 };
    }

    const snapshot = existing.responseSnapshot as BosProvisioningResponse;
    if (isEmailConflictSnapshot(snapshot)) {
      throw new ConflictException({
        code: 'EMAIL_CONFLICT',
        message: 'Primary contact email is already registered',
      });
    }

    const response = toReplayResponse(snapshot);
    await writeBosIntegrationAuditBestEffort(this.prisma.client, {
      requestId,
      status: existing.status === 'failed' ? 'FAILED' : 'SUCCEEDED',
      message: 'idempotent replay',
      payload: { toonexpoCompanyId: existing.toonexpoCompanyId, status: existing.status },
    });

    if (existing.status === 'failed') {
      return { kind: 'failed', response, httpStatus: 200 };
    }
    return { kind: 'idempotent', response, httpStatus: 200 };
  }

  private async handleProvisioningError(
    input: BosProvisioningRequest,
    error: unknown,
  ): Promise<ProvisionOutcome> {
    if (isEmailUniqueViolation(error)) {
      await markFailedIfProcessing(
        this.prisma.client,
        input,
        buildFailedResponse(input.requestId, EMAIL_CONFLICT_ERROR_MESSAGE),
      );
      await writeBosIntegrationAuditBestEffort(this.prisma.client, {
        requestId: input.requestId,
        status: 'FAILED',
        message: 'EMAIL_CONFLICT',
        payload: toBosAuditPayload(input),
      });
      throw new ConflictException({
        code: 'EMAIL_CONFLICT',
        message: 'Primary contact email is already registered',
      });
    }

    logProvisioningFailure(input.requestId, error);
    const failedResponse = buildFailedResponse(input.requestId, 'Provisioning failed');
    await markFailedIfProcessing(this.prisma.client, input, failedResponse);
    await writeBosIntegrationAuditBestEffort(this.prisma.client, {
      requestId: input.requestId,
      status: 'FAILED',
      message: 'PROVISIONING_FAILED',
      payload: toBosAuditPayload(input),
    });
    return { kind: 'failed', response: failedResponse, httpStatus: 200 };
  }

  private async createAccountsInTx(
    tx: Prisma.TransactionClient,
    input: BosProvisioningRequest,
    email: string,
    passwordHash: string,
  ): Promise<BosProvisioningResponse> {
    const role = mapRole(input.companyType);
    const companyId = await resolveCompanyId(tx, input.companyName);
    const user = await tx.user.create({
      data: {
        email,
        name: input.primaryContactName,
        phone: input.primaryContactPhone ?? null,
        passwordHash,
        role,
      },
    });
    await tx.companyMember.create({
      data: { companyId, userId: user.id, role },
    });
    if (needsPartnerProfile(input.companyType)) {
      await ensurePartner(tx, input, companyId);
    }
    return {
      requestId: input.requestId,
      toonexpoCompanyId: companyId,
      primaryUserId: user.id,
      status: 'success',
      createdAt: new Date().toISOString(),
    };
  }
}
