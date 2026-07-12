import { ConflictException } from '@nestjs/common';
import { Prisma } from '@toonexpo/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findUniqueProvisioning, createAudit, upsertProvisioning, transaction } = vi.hoisted(() => ({
  findUniqueProvisioning: vi.fn(),
  createAudit: vi.fn(),
  upsertProvisioning: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock('../../../common/prisma.service', () => ({
  PrismaService: class {
    client = {
      provisioningRequest: {
        findUnique: findUniqueProvisioning,
        upsert: upsertProvisioning,
      },
      integrationAuditLog: {
        create: createAudit,
      },
      $transaction: transaction,
    };
  },
}));

vi.mock('./bos-provisioning.crypto', () => ({
  hashUnusablePassword: vi.fn(async () => 'hashed'),
  allocateUniqueSlug: vi.fn(async (base: string) => base),
}));

import { PrismaService } from '../../../common/prisma.service';

import { BosProvisioningService } from './bos-provisioning.service';

const VALID_BODY = {
  requestId: 'req-100',
  bosCompanyId: 'bos-co-100',
  companyName: 'Acme Builders',
  companyType: 'builder' as const,
  primaryContactName: 'Jane Builder',
  primaryContactEmail: 'jane@example.com',
  requestedModules: ['builder_portal' as const],
};

describe('BosProvisioningService', () => {
  const service = new BosProvisioningService(new PrismaService());

  beforeEach(() => {
    vi.clearAllMocks();
    createAudit.mockResolvedValue({ id: 'audit-1' });
    upsertProvisioning.mockResolvedValue({ id: 'prov-1' });
    findUniqueProvisioning.mockResolvedValue(null);
  });

  it('returns validation issues for invalid payloads', async () => {
    const outcome = await service.provision({ requestId: 'x' });
    expect(outcome.kind).toBe('validation');
    if (outcome.kind === 'validation') {
      expect(outcome.issues.length).toBeGreaterThan(0);
    }
    expect(createAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED', message: 'VALIDATION_ERROR' }),
      }),
    );
  });

  it('replays the original result for the same requestId', async () => {
    const snapshot = {
      requestId: 'req-100',
      toonexpoCompanyId: 'co-1',
      primaryUserId: 'user-1',
      status: 'success',
      createdAt: '2026-07-12T00:00:00.000Z',
    };
    findUniqueProvisioning.mockResolvedValue({
      status: 'success',
      toonexpoCompanyId: 'co-1',
      responseSnapshot: snapshot,
    });

    const outcome = await service.provision(VALID_BODY);
    expect(outcome.kind).toBe('idempotent');
    if (outcome.kind === 'idempotent') {
      expect(outcome.response.idempotent).toBe(true);
      expect(outcome.response.toonexpoCompanyId).toBe('co-1');
      expect(outcome.httpStatus).toBe(200);
    }
    expect(transaction).not.toHaveBeenCalled();
  });

  it('maps email unique violations to ConflictException EMAIL_CONFLICT', async () => {
    transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['email'] },
      }),
    );

    await expect(service.provision(VALID_BODY)).rejects.toBeInstanceOf(ConflictException);
    try {
      await service.provision(VALID_BODY);
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException);
      const body = (error as ConflictException).getResponse();
      expect(body).toMatchObject({ code: 'EMAIL_CONFLICT' });
    }
  });

  it('creates accounts and stores an idempotency record on success', async () => {
    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        company: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({ id: 'co-new' }),
        },
        user: {
          create: vi.fn().mockResolvedValue({ id: 'user-new' }),
        },
        companyMember: {
          create: vi.fn().mockResolvedValue({ id: 'mem-1' }),
        },
        partner: {
          findUnique: vi.fn(),
          create: vi.fn(),
        },
      };
      return fn(tx);
    });

    const outcome = await service.provision(VALID_BODY);
    expect(outcome.kind).toBe('created');
    if (outcome.kind === 'created') {
      expect(outcome.httpStatus).toBe(201);
      expect(outcome.response.status).toBe('success');
      expect(outcome.response.toonexpoCompanyId).toBe('co-new');
      expect(outcome.response.primaryUserId).toBe('user-new');
    }
    expect(upsertProvisioning).toHaveBeenCalled();
  });
});
