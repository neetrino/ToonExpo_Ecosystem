import { ConflictException } from '@nestjs/common';
import { Prisma } from '@toonexpo/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  findUniqueProvisioning,
  createProvisioning,
  createAudit,
  updateManyProvisioning,
  transaction,
} = vi.hoisted(() => ({
  findUniqueProvisioning: vi.fn(),
  createProvisioning: vi.fn(),
  createAudit: vi.fn(),
  updateManyProvisioning: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock('../../../common/prisma.service', () => ({
  PrismaService: class {
    client = {
      provisioningRequest: {
        findUnique: findUniqueProvisioning,
        create: createProvisioning,
        updateMany: updateManyProvisioning,
      },
      integrationAuditLog: {
        create: createAudit,
      },
      $transaction: transaction,
    };
  },
}));

vi.mock('./bos-provisioning.crypto', () => ({
  allocateUniqueSlug: vi.fn(async (base: string) => base),
}));

const { createAccountInvite, sendAccountInviteEmail } = vi.hoisted(() => ({
  createAccountInvite: vi.fn(async () => 'raw-invite-token'),
  sendAccountInviteEmail: vi.fn(async () => ({ sent: true })),
}));

vi.mock('../../../common/invite/create-account-invite', () => ({ createAccountInvite }));
vi.mock('../../../common/invite/invite-url', () => ({
  buildInviteUrl: (token: string) => `https://app.example.com/en/invite/${token}`,
}));
vi.mock('../../../common/email/send-invite-email', () => ({ sendAccountInviteEmail }));

import { PrismaService } from '../../../common/prisma.service';

import { EMAIL_CONFLICT_ERROR_MESSAGE } from './bos-provisioning.constants';
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

function buildTx(overrides: Record<string, unknown> = {}) {
  return {
    provisioningRequest: {
      create: vi.fn().mockResolvedValue({ id: 'claim-1' }),
      update: vi.fn().mockResolvedValue({ id: 'claim-1' }),
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'user-new' }),
    },
    company: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'co-new' }),
    },
    companyMember: {
      create: vi.fn().mockResolvedValue({ id: 'mem-1' }),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    partner: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    ...overrides,
  };
}

describe('BosProvisioningService', () => {
  const service = new BosProvisioningService(new PrismaService());

  beforeEach(() => {
    vi.clearAllMocks();
    createAudit.mockResolvedValue({ id: 'audit-1' });
    createProvisioning.mockResolvedValue({ id: 'prov-1' });
    updateManyProvisioning.mockResolvedValue({ count: 0 });
    findUniqueProvisioning.mockResolvedValue(null);
    createAccountInvite.mockResolvedValue('raw-invite-token');
    sendAccountInviteEmail.mockResolvedValue({ sent: true });
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

  it('replays via P2002 requestId claim race (idempotent)', async () => {
    const snapshot = {
      requestId: 'req-100',
      toonexpoCompanyId: 'co-1',
      primaryUserId: 'user-1',
      status: 'success',
      createdAt: '2026-07-12T00:00:00.000Z',
    };
    transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['requestId'] },
      }),
    );
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
  });

  it('returns busy when claim race finds processing row', async () => {
    transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['requestId'] },
      }),
    );
    findUniqueProvisioning.mockResolvedValue({
      status: 'processing',
      responseSnapshot: {},
    });

    const outcome = await service.provision(VALID_BODY);
    expect(outcome).toEqual({ kind: 'busy', httpStatus: 409 });
  });

  it('returns linked_existing for same bosCompanyId email re-provision', async () => {
    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = buildTx({
        user: {
          findUnique: vi.fn().mockResolvedValue({ id: 'user-existing', role: 'BUILDER' }),
          create: vi.fn(),
        },
        provisioningRequest: {
          create: vi.fn().mockResolvedValue({ id: 'claim-1' }),
          update: vi.fn().mockResolvedValue({ id: 'claim-1' }),
          findFirst: vi.fn().mockResolvedValue({
            toonexpoCompanyId: 'co-existing',
            primaryUserId: 'user-existing',
          }),
          findUnique: vi.fn(),
        },
        companyMember: {
          findUnique: vi.fn().mockResolvedValue({ id: 'mem-existing' }),
          create: vi.fn(),
        },
      });
      return fn(tx);
    });

    const outcome = await service.provision(VALID_BODY);
    expect(outcome.kind).toBe('linked');
    if (outcome.kind === 'linked') {
      expect(outcome.response.status).toBe('linked_existing');
      expect(outcome.response.toonexpoCompanyId).toBe('co-existing');
      expect(outcome.response.primaryUserId).toBe('user-existing');
      expect(outcome.httpStatus).toBe(200);
    }
  });

  it('maps plain email conflicts to ConflictException EMAIL_CONFLICT', async () => {
    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = buildTx({
        user: {
          findUnique: vi.fn().mockResolvedValue({ id: 'user-other', role: 'BUYER' }),
          create: vi.fn(),
        },
        provisioningRequest: {
          create: vi.fn().mockResolvedValue({ id: 'claim-1' }),
          update: vi.fn().mockResolvedValue({ id: 'claim-1' }),
          findFirst: vi.fn().mockResolvedValue(null),
          findUnique: vi.fn(),
        },
      });
      return fn(tx);
    });

    await expect(service.provision(VALID_BODY)).rejects.toBeInstanceOf(ConflictException);
    try {
      await service.provision(VALID_BODY);
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException);
      const body = (error as ConflictException).getResponse();
      expect(body).toMatchObject({ code: 'EMAIL_CONFLICT' });
    }
  });

  it('creates accounts and stores success snapshot in the claim transaction', async () => {
    const txUpdate = vi.fn().mockResolvedValue({ id: 'claim-1' });
    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = buildTx({
        provisioningRequest: {
          create: vi.fn().mockResolvedValue({ id: 'claim-1' }),
          update: txUpdate,
          findFirst: vi.fn(),
          findUnique: vi.fn(),
        },
      });
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
    expect(txUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'success' }),
      }),
    );
    expect(createAccountInvite).toHaveBeenCalledWith(expect.anything(), 'user-new');
    expect(sendAccountInviteEmail).toHaveBeenCalledWith({
      to: VALID_BODY.primaryContactEmail,
      name: VALID_BODY.primaryContactName,
      inviteUrl: 'https://app.example.com/en/invite/raw-invite-token',
    });
  });

  it('does not send an invite email for linked_existing accounts', async () => {
    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = buildTx({
        user: {
          findUnique: vi.fn().mockResolvedValue({ id: 'user-existing', role: 'BUILDER' }),
          create: vi.fn(),
        },
        provisioningRequest: {
          create: vi.fn().mockResolvedValue({ id: 'claim-1' }),
          update: vi.fn().mockResolvedValue({ id: 'claim-1' }),
          findFirst: vi.fn().mockResolvedValue({
            toonexpoCompanyId: 'co-existing',
            primaryUserId: 'user-existing',
          }),
          findUnique: vi.fn(),
        },
        companyMember: {
          findUnique: vi.fn().mockResolvedValue({ id: 'mem-existing' }),
          create: vi.fn(),
        },
      });
      return fn(tx);
    });

    const outcome = await service.provision(VALID_BODY);
    expect(outcome.kind).toBe('linked');
    expect(createAccountInvite).not.toHaveBeenCalled();
    expect(sendAccountInviteEmail).not.toHaveBeenCalled();
  });

  it('replays stored EMAIL_CONFLICT failure as ConflictException', async () => {
    transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['requestId'] },
      }),
    );
    findUniqueProvisioning.mockResolvedValue({
      status: 'failed',
      responseSnapshot: {
        requestId: 'req-100',
        toonexpoCompanyId: null,
        primaryUserId: null,
        status: 'failed',
        errorMessage: EMAIL_CONFLICT_ERROR_MESSAGE,
        createdAt: '2026-07-12T00:00:00.000Z',
      },
    });

    await expect(service.provision(VALID_BODY)).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'EMAIL_CONFLICT' }),
    });
  });
});
