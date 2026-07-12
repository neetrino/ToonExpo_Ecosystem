import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  verificationTokenFindUnique,
  verificationTokenDelete,
  verificationTokenDeleteMany,
  verificationTokenCreate,
  userUpdate,
  transaction,
} = vi.hoisted(() => ({
  verificationTokenFindUnique: vi.fn(),
  verificationTokenDelete: vi.fn(),
  verificationTokenDeleteMany: vi.fn(),
  verificationTokenCreate: vi.fn(),
  userUpdate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    verificationToken: { findUnique: verificationTokenFindUnique },
    $transaction: transaction,
  },
}));

import { hashInviteToken } from './invite-token';
import { consumeAccountInvite, createAccountInvite, previewAccountInvite } from './invite';

function buildTx() {
  return {
    verificationToken: {
      findUnique: verificationTokenFindUnique,
      delete: verificationTokenDelete,
      deleteMany: verificationTokenDeleteMany,
      create: verificationTokenCreate,
    },
    user: { update: userUpdate },
  };
}

describe('createAccountInvite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalidates previous invites before creating a new one', async () => {
    const tx = buildTx();
    const rawToken = await createAccountInvite(tx as never, 'user-1');

    expect(verificationTokenDeleteMany).toHaveBeenCalledWith({
      where: { identifier: 'invite:user-1' },
    });
    expect(verificationTokenCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        identifier: 'invite:user-1',
        token: hashInviteToken(rawToken),
      }),
    });
    expect(rawToken).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('previewAccountInvite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('accepts a valid, unexpired invite', async () => {
    verificationTokenFindUnique.mockResolvedValue({
      identifier: 'invite:user-1',
      expires: new Date(Date.now() + 1000 * 60 * 60),
    });

    await expect(previewAccountInvite('raw-token')).resolves.toEqual({ ok: true });
  });

  it('rejects a missing token', async () => {
    verificationTokenFindUnique.mockResolvedValue(null);
    await expect(previewAccountInvite('raw-token')).resolves.toEqual({
      ok: false,
      error: 'invalidOrExpired',
    });
  });

  it('rejects an expired token', async () => {
    verificationTokenFindUnique.mockResolvedValue({
      identifier: 'invite:user-1',
      expires: new Date(Date.now() - 1000),
    });
    await expect(previewAccountInvite('raw-token')).resolves.toEqual({
      ok: false,
      error: 'invalidOrExpired',
    });
  });
});

describe('consumeAccountInvite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn(buildTx()));
  });

  it('sets the password hash and deletes the token on success', async () => {
    verificationTokenFindUnique.mockResolvedValue({
      identifier: 'invite:user-1',
      expires: new Date(Date.now() + 1000 * 60 * 60),
    });

    const result = await consumeAccountInvite('raw-token', 'hashed-password');

    expect(result).toEqual({ ok: true });
    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { passwordHash: 'hashed-password' },
    });
    expect(verificationTokenDelete).toHaveBeenCalledWith({
      where: { token: hashInviteToken('raw-token') },
    });
  });

  it('rejects an expired invite without updating the user', async () => {
    verificationTokenFindUnique.mockResolvedValue({
      identifier: 'invite:user-1',
      expires: new Date(Date.now() - 1000),
    });

    const result = await consumeAccountInvite('raw-token', 'hashed-password');

    expect(result).toEqual({ ok: false, error: 'invalidOrExpired' });
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it('rejects reuse of an already-consumed (missing) token', async () => {
    verificationTokenFindUnique.mockResolvedValue(null);

    const result = await consumeAccountInvite('raw-token', 'hashed-password');

    expect(result).toEqual({ ok: false, error: 'invalidOrExpired' });
    expect(userUpdate).not.toHaveBeenCalled();
  });
});
