import type { BosProvisioningRequest, BosProvisioningResponse } from '@toonexpo/contracts';
import type { Prisma, PrismaClient } from '@toonexpo/db';
import { createAppLogger } from '../../../common/logger';

import {
  BOS_PROVISIONING_OPERATION,
  PROVISIONING_CLAIM_STATUS,
} from './bos-provisioning.constants';
import { isRequestIdUniqueViolation } from './bos-provisioning.idempotency';

const logger = createAppLogger('bos-provisioning');

export type IntegrationAuditInput = {
  requestId: string | null;
  status: 'RECEIVED' | 'SUCCEEDED' | 'FAILED';
  message: string;
  payload: Prisma.InputJsonValue;
};

export function toBosAuditPayload(input: BosProvisioningRequest): Prisma.InputJsonValue {
  return {
    bosCompanyId: input.bosCompanyId,
    companyType: input.companyType,
    requestedModules: input.requestedModules,
    partnerType: input.partnerType ?? null,
    eventCycleId: input.eventCycleId ?? null,
  };
}

export function extractRequestId(rawBody: unknown): string | null {
  if (typeof rawBody !== 'object' || rawBody === null) {
    return null;
  }
  const value = (rawBody as { requestId?: unknown }).requestId;
  return typeof value === 'string' ? value : null;
}

/** Post-commit integration audit — never throws; never rewrites idempotency. */
export async function writeBosIntegrationAuditBestEffort(
  client: PrismaClient,
  input: IntegrationAuditInput,
): Promise<void> {
  try {
    await client.integrationAuditLog.create({
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
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown';
    logger.warn({ requestId: input.requestId, err: detail }, 'BOS integration audit write failed');
  }
}

/**
 * Marks the claim failed only when it still belongs to this attempt (processing).
 * Never overwrites a success / linked_existing snapshot.
 */
export async function markFailedIfProcessing(
  client: PrismaClient,
  input: BosProvisioningRequest,
  failedResponse: BosProvisioningResponse,
): Promise<void> {
  const snapshot = failedResponse as unknown as Prisma.InputJsonValue;
  const updated = await client.provisioningRequest.updateMany({
    where: { requestId: input.requestId, status: PROVISIONING_CLAIM_STATUS },
    data: {
      status: failedResponse.status,
      toonexpoCompanyId: failedResponse.toonexpoCompanyId,
      primaryUserId: failedResponse.primaryUserId,
      errorMessage: failedResponse.errorMessage ?? null,
      responseSnapshot: snapshot,
    },
  });
  if (updated.count > 0) {
    return;
  }

  try {
    await client.provisioningRequest.create({
      data: {
        requestId: input.requestId,
        bosCompanyId: input.bosCompanyId,
        primaryContactEmail: input.primaryContactEmail.toLowerCase(),
        status: failedResponse.status,
        toonexpoCompanyId: failedResponse.toonexpoCompanyId,
        primaryUserId: failedResponse.primaryUserId,
        errorMessage: failedResponse.errorMessage ?? null,
        responseSnapshot: snapshot,
      },
    });
  } catch (error) {
    if (!isRequestIdUniqueViolation(error)) {
      throw error;
    }
  }
}

export function logProvisioningFailure(requestId: string, error: unknown): void {
  const detail = error instanceof Error ? error.message : 'Provisioning failed';
  logger.error({ requestId, err: detail }, 'BOS provisioning failed');
}
