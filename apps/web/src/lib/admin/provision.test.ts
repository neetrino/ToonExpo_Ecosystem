import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/shared/unique-slug', () => ({
  allocateUniqueSlug: vi.fn(),
  MAX_SLUG_ATTEMPTS: 50,
}));

const { userCreate, transaction, recordAudit, createAccountInvite, sendAccountInviteEmail } =
  vi.hoisted(() => ({
    userCreate: vi.fn(),
    transaction: vi.fn(),
    recordAudit: vi.fn(),
    createAccountInvite: vi.fn(),
    sendAccountInviteEmail: vi.fn(),
  }));

vi.mock('@toonexpo/db', () => ({
  prisma: { user: { create: userCreate }, $transaction: transaction },
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
      code: string;
      meta?: { target?: string[] };
      constructor(message: string, opts: { code: string; meta?: { target?: string[] } }) {
        super(message);
        this.code = opts.code;
        this.meta = opts.meta;
      }
    },
  },
}));

vi.mock('@/lib/audit/record-audit', () => ({ recordAudit }));
vi.mock('@/lib/auth/invite', () => ({ createAccountInvite }));
vi.mock('@/lib/auth/invite-url', () => ({
  buildInviteUrl: (token: string) => `https://app.example.com/en/invite/${token}`,
}));
vi.mock('@/lib/email/send-invite-email', () => ({ sendAccountInviteEmail }));
vi.mock('@/lib/env', () => ({ loadWebEnv: vi.fn() }));

import { loadWebEnv } from '@/lib/env';

import { provisionAccount } from './provision';

const ACTOR = { userId: 'admin-1', role: 'BIGPROJECTS_ADMIN' as const };
const INPUT = {
  email: 'staff@example.com',
  name: 'Staff Member',
  role: 'ENTRANCE_STAFF' as const,
};

function buildTx() {
  return { user: { create: userCreate } };
}

describe('provisionAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn(buildTx()));
    userCreate.mockResolvedValue({ id: 'user-1' });
    createAccountInvite.mockResolvedValue('raw-invite-token');
    sendAccountInviteEmail.mockResolvedValue({ sent: true });
    vi.mocked(loadWebEnv).mockReturnValue({ NODE_ENV: 'production' } as never);
  });

  it('creates the user without a password and issues an invite', async () => {
    const result = await provisionAccount(INPUT, ACTOR);

    expect(userCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ passwordHash: null, role: 'ENTRANCE_STAFF' }),
    });
    expect(createAccountInvite).toHaveBeenCalledWith(expect.anything(), 'user-1');
    expect(result).toEqual({ ok: true, userId: 'user-1', companyId: undefined, emailSent: true });
  });

  it('reports emailSent:false when Resend fails, without failing provisioning', async () => {
    sendAccountInviteEmail.mockResolvedValue({ sent: false });

    const result = await provisionAccount(INPUT, ACTOR);

    expect(result).toMatchObject({ ok: true, emailSent: false });
  });

  it('exposes inviteUrl only outside production', async () => {
    vi.mocked(loadWebEnv).mockReturnValue({ NODE_ENV: 'development' } as never);

    const result = await provisionAccount(INPUT, ACTOR);

    expect(result).toMatchObject({
      ok: true,
      inviteUrl: 'https://app.example.com/en/invite/raw-invite-token',
    });
  });

  it('never exposes inviteUrl in production', async () => {
    const result = await provisionAccount(INPUT, ACTOR);
    expect(result).toMatchObject({ ok: true, inviteUrl: undefined });
  });
});
