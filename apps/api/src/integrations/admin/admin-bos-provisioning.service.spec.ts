import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BosProvisioningStatus } from '@toonexpo/db';

import type { PrismaService } from '../../prisma/prisma.service.js';
import { AdminBosProvisioningService } from './admin-bos-provisioning.service.js';

describe('AdminBosProvisioningService', () => {
  const transaction = vi.fn();
  const bosProvisioningRequestCount = vi.fn();
  const bosProvisioningRequestFindMany = vi.fn();
  const bosProvisioningRequestFindUnique = vi.fn();
  const integrationAuditLogFindMany = vi.fn();

  let service: AdminBosProvisioningService;

  beforeEach(() => {
    vi.clearAllMocks();

    transaction.mockImplementation(async (queries: Promise<unknown>[]) => Promise.all(queries));

    const prisma = {
      db: {
        $transaction: transaction,
        bosProvisioningRequest: {
          count: bosProvisioningRequestCount,
          findMany: bosProvisioningRequestFindMany,
          findUnique: bosProvisioningRequestFindUnique,
        },
        integrationAuditLog: {
          findMany: integrationAuditLogFindMany,
        },
      },
    } as unknown as PrismaService;

    service = new AdminBosProvisioningService(prisma);
  });

  it('lists provisioning requests with pagination', async () => {
    const createdAt = new Date('2026-07-19T10:00:00.000Z');
    const updatedAt = new Date('2026-07-19T10:05:00.000Z');

    bosProvisioningRequestCount.mockResolvedValue(1);
    bosProvisioningRequestFindMany.mockResolvedValue([
      {
        id: 'req_internal_1',
        requestId: 'req-wire-1',
        bosCompanyId: 'bos-co-1',
        companyName: 'Acme Builder',
        companyType: 'builder',
        primaryContactName: 'Jane Doe',
        primaryContactEmail: 'jane@example.com',
        primaryContactPhone: null,
        eventCycleId: null,
        eventCycleName: null,
        requestedModules: ['builder_portal'],
        status: BosProvisioningStatus.success,
        toonexpoCompanyId: 'co_1',
        primaryUserId: 'user_1',
        errorMessage: null,
        attemptCount: 1,
        createdAt,
        updatedAt,
      },
    ]);

    const result = await service.list(1, 20);

    expect(bosProvisioningRequestFindMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 20,
    });
    expect(result.meta).toEqual({
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1,
    });
    expect(result.data[0]).toMatchObject({
      requestId: 'req-wire-1',
      companyName: 'Acme Builder',
      bosCompanyId: 'bos-co-1',
      status: 'success',
      errorMessage: null,
    });
  });

  it('filters list by status', async () => {
    bosProvisioningRequestCount.mockResolvedValue(0);
    bosProvisioningRequestFindMany.mockResolvedValue([]);

    await service.list(2, 10, BosProvisioningStatus.failed);

    expect(bosProvisioningRequestFindMany).toHaveBeenCalledWith({
      where: { status: BosProvisioningStatus.failed },
      orderBy: { createdAt: 'desc' },
      skip: 10,
      take: 10,
    });
  });

  it('returns detail with audit logs', async () => {
    const createdAt = new Date('2026-07-19T10:00:00.000Z');
    const updatedAt = new Date('2026-07-19T10:05:00.000Z');

    bosProvisioningRequestFindUnique.mockResolvedValue({
      id: 'req_internal_1',
      requestId: 'req-wire-1',
      bosCompanyId: 'bos-co-1',
      companyName: 'Acme Builder',
      companyType: 'builder',
      primaryContactName: 'Jane Doe',
      primaryContactEmail: 'jane@example.com',
      primaryContactPhone: '+37491110000',
      eventCycleId: 'cycle_1',
      eventCycleName: 'Expo 2026',
      requestedModules: ['builder_portal', 'constructor_crm'],
      status: BosProvisioningStatus.failed,
      toonexpoCompanyId: 'co_1',
      primaryUserId: null,
      errorMessage: 'Email already registered',
      attemptCount: 2,
      createdAt,
      updatedAt,
    });
    integrationAuditLogFindMany.mockResolvedValue([
      {
        id: 'log_1',
        action: 'provisioning_received',
        details: { request_id: 'req-wire-1' },
        createdAt,
        provisioningRequestId: 'req_internal_1',
      },
    ]);

    const result = await service.getById('req_internal_1');

    expect(result).toMatchObject({
      errorMessage: 'Email already registered',
      requestedModules: ['builder_portal', 'constructor_crm'],
      auditLogs: [
        expect.objectContaining({
          action: 'provisioning_received',
        }),
      ],
    });
  });

  it('throws when provisioning request is missing', async () => {
    bosProvisioningRequestFindUnique.mockResolvedValue(null);

    await expect(service.getById('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
