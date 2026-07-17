import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAccountInvite } from './invite';
import { hashInviteToken } from './invite-token';

const deleteMany = vi.fn();
const create = vi.fn();

describe('createAccountInvite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalidates previous invites before creating a new one', async () => {
    const tx = {
      verificationToken: { deleteMany, create },
    };

    const rawToken = await createAccountInvite(tx as never, 'user-1');

    expect(deleteMany).toHaveBeenCalledWith({
      where: { identifier: 'invite:user-1' },
    });
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        identifier: 'invite:user-1',
        token: hashInviteToken(rawToken),
      }),
    });
    expect(rawToken).toMatch(/^[0-9a-f]{64}$/);
  });
});
