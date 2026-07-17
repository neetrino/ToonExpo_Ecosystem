import { beforeEach, describe, expect, it, vi } from 'vitest';

const { hashPassword } = vi.hoisted(() => ({
  hashPassword: vi.fn(async () => 'hashed-password'),
}));

vi.mock('./password', () => ({ hashPassword }));

import { hashInviteToken } from '../../common/invite/invite-token';
import { AccountInviteService } from './account-invite.service';

const findUnique = vi.fn();
const deleteToken = vi.fn();
const updateUser = vi.fn();
const transaction = vi.fn();

function createService(): AccountInviteService {
  const tx = {
    verificationToken: { findUnique, delete: deleteToken },
    user: { update: updateUser },
  };
  transaction.mockImplementation(async (callback: (client: typeof tx) => Promise<void>) => {
    await callback(tx);
  });

  const prisma = {
    client: {
      verificationToken: { findUnique },
      $transaction: transaction,
    },
  };
  return new AccountInviteService(prisma as never);
}

describe('AccountInviteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('previews a valid, unexpired invite', async () => {
    findUnique.mockResolvedValue({
      identifier: 'invite:user-1',
      expires: new Date(Date.now() + 60_000),
    });

    await expect(createService().preview('raw-token')).resolves.toEqual({ ok: true });
    expect(findUnique).toHaveBeenCalledWith({
      where: { token: hashInviteToken('raw-token') },
      select: { identifier: true, expires: true },
    });
  });

  it('rejects missing and expired invites during preview', async () => {
    const service = createService();
    findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
      identifier: 'invite:user-1',
      expires: new Date(Date.now() - 1),
    });

    await expect(service.preview('missing')).resolves.toEqual({
      ok: false,
      code: 'INVALID_INVITE',
    });
    await expect(service.preview('expired')).resolves.toEqual({
      ok: false,
      code: 'INVALID_INVITE',
    });
  });

  it('validates the set-password payload before hashing', async () => {
    const result = await createService().setPassword({
      token: 'raw-token',
      password: 'sup3rsecret',
      confirmPassword: 'different',
    });

    expect(result).toEqual({ ok: false, code: 'VALIDATION_ERROR' });
    expect(hashPassword).not.toHaveBeenCalled();
  });

  it('consumes the invite and sets the password hash atomically', async () => {
    findUnique.mockResolvedValue({
      identifier: 'invite:user-1',
      expires: new Date(Date.now() + 60_000),
    });

    const result = await createService().setPassword({
      token: 'raw-token',
      password: 'sup3rsecret',
      confirmPassword: 'sup3rsecret',
    });

    expect(result).toEqual({ ok: true });
    expect(deleteToken).toHaveBeenCalledWith({
      where: { token: hashInviteToken('raw-token') },
    });
    expect(updateUser).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { passwordHash: 'hashed-password' },
    });
  });

  it('rejects an invite that cannot be consumed', async () => {
    findUnique.mockResolvedValue(null);

    const result = await createService().setPassword({
      token: 'raw-token',
      password: 'sup3rsecret',
      confirmPassword: 'sup3rsecret',
    });

    expect(result).toEqual({ ok: false, code: 'INVALID_INVITE' });
    expect(updateUser).not.toHaveBeenCalled();
  });
});
