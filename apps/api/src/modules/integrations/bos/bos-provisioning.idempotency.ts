import type { BosProvisioningRequest, BosProvisioningResponse } from '@toonexpo/contracts';
import { Prisma, type PlatformRole } from '@toonexpo/db';

import {
  EMAIL_CONFLICT_ERROR_MESSAGE,
  PROVISIONING_CLAIM_STATUS,
  PROVISIONING_TERMINAL_STATUSES,
  PRISMA_UNIQUE_CONSTRAINT,
} from './bos-provisioning.constants';

type Tx = Prisma.TransactionClient;

export type ClaimTxResult =
  | { kind: 'success'; response: BosProvisioningResponse }
  | { kind: 'linked'; response: BosProvisioningResponse }
  | { kind: 'email_conflict'; response: BosProvisioningResponse };

export function isUniqueTarget(
  error: Prisma.PrismaClientKnownRequestError,
  field: string,
): boolean {
  const target = error.meta?.target;
  return Array.isArray(target) && target.includes(field);
}

export function isRequestIdUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === PRISMA_UNIQUE_CONSTRAINT &&
    isUniqueTarget(error, 'requestId')
  );
}

export function isEmailUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === PRISMA_UNIQUE_CONSTRAINT &&
    isUniqueTarget(error, 'email')
  );
}

export function isTerminalProvisioningStatus(status: string): boolean {
  return (PROVISIONING_TERMINAL_STATUSES as readonly string[]).includes(status);
}

export function isEmailConflictSnapshot(response: BosProvisioningResponse): boolean {
  return response.status === 'failed' && response.errorMessage === EMAIL_CONFLICT_ERROR_MESSAGE;
}

export function buildFailedResponse(
  requestId: string,
  errorMessage: string,
): BosProvisioningResponse {
  return {
    requestId,
    toonexpoCompanyId: null,
    primaryUserId: null,
    status: 'failed',
    errorMessage,
    createdAt: new Date().toISOString(),
  };
}

export function toReplayResponse(snapshot: BosProvisioningResponse): BosProvisioningResponse {
  return { ...snapshot, idempotent: true };
}

/**
 * When the primary email already exists, return linked_existing iff a prior
 * successful provisioning for the same bosCompanyId owns that user/email
 * (re-provision). Otherwise null → EMAIL_CONFLICT.
 * Docs: 15-Integrations/02-BOS-Account-Provisioning (`linked_existing`).
 */
export async function tryLinkedExisting(
  tx: Tx,
  input: BosProvisioningRequest,
  existingUser: { id: string; role: PlatformRole },
): Promise<BosProvisioningResponse | null> {
  const email = input.primaryContactEmail.toLowerCase();
  const prior = await tx.provisioningRequest.findFirst({
    where: {
      bosCompanyId: input.bosCompanyId,
      status: { in: ['success', 'linked_existing'] },
      OR: [{ primaryUserId: existingUser.id }, { primaryContactEmail: email }],
    },
    orderBy: { createdAt: 'asc' },
  });

  if (!prior?.toonexpoCompanyId || !prior.primaryUserId) {
    return null;
  }

  const member = await tx.companyMember.findUnique({
    where: {
      companyId_userId: {
        companyId: prior.toonexpoCompanyId,
        userId: existingUser.id,
      },
    },
  });
  if (!member) {
    await tx.companyMember.create({
      data: {
        companyId: prior.toonexpoCompanyId,
        userId: existingUser.id,
        role: existingUser.role,
      },
    });
  }

  return {
    requestId: input.requestId,
    toonexpoCompanyId: prior.toonexpoCompanyId,
    primaryUserId: existingUser.id,
    status: 'linked_existing',
    createdAt: new Date().toISOString(),
  };
}

export async function writeClaimSnapshot(
  tx: Tx,
  requestId: string,
  response: BosProvisioningResponse,
): Promise<void> {
  await tx.provisioningRequest.update({
    where: { requestId },
    data: {
      status: response.status,
      toonexpoCompanyId: response.toonexpoCompanyId,
      primaryUserId: response.primaryUserId,
      errorMessage: response.errorMessage ?? null,
      responseSnapshot: response as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function createProcessingClaim(tx: Tx, input: BosProvisioningRequest): Promise<void> {
  await tx.provisioningRequest.create({
    data: {
      requestId: input.requestId,
      bosCompanyId: input.bosCompanyId,
      primaryContactEmail: input.primaryContactEmail.toLowerCase(),
      status: PROVISIONING_CLAIM_STATUS,
      responseSnapshot: {},
    },
  });
}
