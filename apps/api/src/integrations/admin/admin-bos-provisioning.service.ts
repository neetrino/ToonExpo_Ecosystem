import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  AdminBosProvisioningDetail,
  AdminBosProvisioningListResponse,
} from "@toonexpo/contracts";
import type { BosProvisioningStatus, Prisma } from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";
import {
  toAdminBosProvisioningDetail,
  toAdminBosProvisioningListItem,
} from "../bos/bos-provisioning.mapper.js";

@Injectable()
export class AdminBosProvisioningService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    page: number,
    pageSize: number,
    status?: BosProvisioningStatus,
  ): Promise<AdminBosProvisioningListResponse> {
    const where: Prisma.BosProvisioningRequestWhereInput = status
      ? { status }
      : {};
    const skip = (page - 1) * pageSize;

    const [total, rows] = await this.prisma.db.$transaction([
      this.prisma.db.bosProvisioningRequest.count({ where }),
      this.prisma.db.bosProvisioningRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    return {
      data: rows.map(toAdminBosProvisioningListItem),
      meta: {
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
      },
    };
  }

  async getById(id: string): Promise<AdminBosProvisioningDetail> {
    const record = await this.prisma.db.bosProvisioningRequest.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException("BOS provisioning request not found");
    }

    const auditLogs = await this.prisma.db.integrationAuditLog.findMany({
      where: { provisioningRequestId: id },
      orderBy: { createdAt: "asc" },
    });

    return toAdminBosProvisioningDetail(record, auditLogs);
  }
}
