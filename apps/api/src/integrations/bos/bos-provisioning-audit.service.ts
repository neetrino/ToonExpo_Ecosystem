import { Injectable } from "@nestjs/common";
import type { IntegrationAuditAction } from "@toonexpo/contracts";
import { IntegrationAuditAction as DbIntegrationAuditAction, type Prisma } from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";

type AuditClient = PrismaService["db"] | Prisma.TransactionClient;

/**
 * Append-only audit writer for BOS provisioning steps.
 */
@Injectable()
export class BosProvisioningAuditService {
  async write(
    db: AuditClient,
    provisioningRequestId: string,
    action: IntegrationAuditAction,
    details?: Record<string, unknown>,
  ): Promise<void> {
    await db.integrationAuditLog.create({
      data: {
        provisioningRequestId,
        action: action as DbIntegrationAuditAction,
        ...(details ? { details: details as Prisma.InputJsonValue } : {}),
      },
    });
  }
}
