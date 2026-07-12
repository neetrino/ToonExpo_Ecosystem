import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  bosProvisioningRequestSchema,
  type BosProvisioningRequest,
  type BosProvisioningResponse,
} from '@toonexpo/contracts';
import { Prisma } from '@toonexpo/db';
import pino from 'pino';

import { PrismaService } from '../../../common/prisma.service';

import {
  ensurePartner,
  mapRole,
  needsPartnerProfile,
  resolveCompanyId,
} from './bos-provisioning.accounts';
import { BOS_PROVISIONING_OPERATION, PRISMA_UNIQUE_CONSTRAINT } from './bos-provisioning.constants';
import { hashUnusablePassword } from './bos-provisioning.crypto';

const logger = pino({ name: 'bos-provisioning' });

export type ProvisionOutcome =
  | { kind: 'created'; response: BosProvisioningResponse; httpStatus: 201 }
  | { kind: 'idempotent'; response: BosProvisioningResponse; httpStatus: 200 }
  | { kind: 'failed'; response: BosProvisioningResponse; httpStatus: 200 }
  | { kind: 'validation'; issues: Array<{ path: string; message: string }> };

function isEmailUniqueViolation(error: Prisma.PrismaClientKnownRequestError): boolean {
  const target = error.meta?.target;
  return Array.isArray(target) && target.includes('email');
}

function toAuditPayload(input: BosProvisioningRequest): Prisma.InputJsonValue {
  return {
    bosCompanyId: input.bosCompanyId,
    companyType: input.companyType,
    requestedModules: input.requestedModules,
    partnerType: input.partnerType ?? null,
    eventCycleId: input.eventCycleId ?? null,
  };
}

function extractRequestId(rawBody: unknown): string | null {
  if (typeof rawBody !== 'object' || rawBody === null) {
    return null;
  }
  const value = (rawBody as { requestId?: unknown }).requestId;
  return typeof value === 'string' ? value : null;
}

@Injectable()
export class BosProvisioningService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async provision(rawBody: unknown): Promise<ProvisionOutcome> {
    const parsed = bosProvisioningRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return this.handleValidationFailure(rawBody, parsed.error.issues);
    }

    const input = parsed.data;
    await this.writeAudit({
      requestId: input.requestId,
      status: 'RECEIVED',
      message: 'provisioning request received',
      payload: toAuditPayload(input),
    });

    const replay = await this.tryIdempotentReplay(input.requestId);
    if (replay) {
      return replay;
    }

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
    await this.writeAudit({
      requestId: extractRequestId(rawBody),
      status: 'FAILED',
      message: 'VALIDATION_ERROR',
      payload: { issueCount: issues.length },
    });
    return { kind: 'validation', issues };
  }

  private async tryIdempotentReplay(requestId: string): Promise<ProvisionOutcome | null> {
    const existing = await this.prisma.client.provisioningRequest.findUnique({
      where: { requestId },
    });
    if (!existing || existing.status === 'failed') {
      return null;
    }

    const response = {
      ...(existing.responseSnapshot as BosProvisioningResponse),
      idempotent: true,
    };
    await this.writeAudit({
      requestId,
      status: 'SUCCEEDED',
      message: 'idempotent replay',
      payload: { toonexpoCompanyId: existing.toonexpoCompanyId },
    });
    return { kind: 'idempotent', response, httpStatus: 200 };
  }

  private async executeProvisioning(input: BosProvisioningRequest): Promise<ProvisionOutcome> {
    try {
      const response = await this.createAccounts(input);
      await this.upsertIdempotencyRecord(input, response);
      await this.writeAudit({
        requestId: input.requestId,
        status: 'SUCCEEDED',
        message: 'account provisioned',
        payload: {
          toonexpoCompanyId: response.toonexpoCompanyId,
          primaryUserId: response.primaryUserId,
          status: response.status,
        },
      });
      return { kind: 'created', response, httpStatus: 201 };
    } catch (error) {
      return this.handleProvisioningError(input, error);
    }
  }

  private async handleProvisioningError(
    input: BosProvisioningRequest,
    error: unknown,
  ): Promise<ProvisionOutcome> {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === PRISMA_UNIQUE_CONSTRAINT &&
      isEmailUniqueViolation(error)
    ) {
      await this.writeAudit({
        requestId: input.requestId,
        status: 'FAILED',
        message: 'EMAIL_CONFLICT',
        payload: toAuditPayload(input),
      });
      throw new ConflictException({
        code: 'EMAIL_CONFLICT',
        message: 'Primary contact email is already registered',
      });
    }

    const detail = error instanceof Error ? error.message : 'Provisioning failed';
    logger.error({ requestId: input.requestId, err: detail }, 'BOS provisioning failed');
    const failedResponse: BosProvisioningResponse = {
      requestId: input.requestId,
      toonexpoCompanyId: null,
      primaryUserId: null,
      status: 'failed',
      errorMessage: 'Provisioning failed',
      createdAt: new Date().toISOString(),
    };
    await this.upsertIdempotencyRecord(input, failedResponse);
    await this.writeAudit({
      requestId: input.requestId,
      status: 'FAILED',
      message: 'PROVISIONING_FAILED',
      payload: toAuditPayload(input),
    });
    return { kind: 'failed', response: failedResponse, httpStatus: 200 };
  }

  private async createAccounts(input: BosProvisioningRequest): Promise<BosProvisioningResponse> {
    const passwordHash = await hashUnusablePassword();
    const role = mapRole(input.companyType);
    const email = input.primaryContactEmail.toLowerCase();

    const result = await this.prisma.client.$transaction(async (tx) => {
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
      return { companyId, userId: user.id };
    });

    return {
      requestId: input.requestId,
      toonexpoCompanyId: result.companyId,
      primaryUserId: result.userId,
      status: 'success',
      createdAt: new Date().toISOString(),
    };
  }

  private async upsertIdempotencyRecord(
    input: BosProvisioningRequest,
    response: BosProvisioningResponse,
  ): Promise<void> {
    const snapshot = response as unknown as Prisma.InputJsonValue;
    await this.prisma.client.provisioningRequest.upsert({
      where: { requestId: input.requestId },
      create: {
        requestId: input.requestId,
        bosCompanyId: input.bosCompanyId,
        primaryContactEmail: input.primaryContactEmail.toLowerCase(),
        status: response.status,
        toonexpoCompanyId: response.toonexpoCompanyId,
        primaryUserId: response.primaryUserId,
        errorMessage: response.errorMessage ?? null,
        responseSnapshot: snapshot,
      },
      update: {
        status: response.status,
        toonexpoCompanyId: response.toonexpoCompanyId,
        primaryUserId: response.primaryUserId,
        errorMessage: response.errorMessage ?? null,
        responseSnapshot: snapshot,
      },
    });
  }

  private async writeAudit(input: {
    requestId: string | null;
    status: 'RECEIVED' | 'SUCCEEDED' | 'FAILED';
    message: string;
    payload: Prisma.InputJsonValue;
  }): Promise<void> {
    await this.prisma.client.integrationAuditLog.create({
      data: {
        direction: 'INBOUND',
        operation: BOS_PROVISIONING_OPERATION,
        externalRef: input.requestId,
        requestId: input.requestId,
        status: input.status,
        message: input.message,
        payload: input.payload,
      },
    });
  }
}
