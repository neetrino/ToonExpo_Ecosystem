import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InviteMailerService } from '../../access-tokens/invite-mailer.service.js';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { CompanyProvisioningService } from './company-provisioning.service.js';

const inviteInput = {
  userId: 'user_1',
  email: 'admin@example.com',
  name: 'Admin',
};

describe('CompanyProvisioningService.sendSetPasswordInviteBestEffort', () => {
  const sendSetPasswordInvite = vi.fn();
  let service: CompanyProvisioningService;

  beforeEach(() => {
    sendSetPasswordInvite.mockReset();
    service = new CompanyProvisioningService(
      {} as PrismaService,
      { sendSetPasswordInvite } as unknown as InviteMailerService,
    );
  });

  it('resolves when the invite email is sent', async () => {
    sendSetPasswordInvite.mockResolvedValue(undefined);

    await expect(service.sendSetPasswordInviteBestEffort(inviteInput)).resolves.toBeUndefined();
    expect(sendSetPasswordInvite).toHaveBeenCalledOnce();
  });

  it('does not throw when the invite email fails after the account exists', async () => {
    sendSetPasswordInvite.mockRejectedValue(new Error('Failed to send email'));

    await expect(service.sendSetPasswordInviteBestEffort(inviteInput)).resolves.toBeUndefined();
    expect(sendSetPasswordInvite).toHaveBeenCalledOnce();
  });

  it('still throws from sendSetPasswordInvite so explicit resend can fail visibly', async () => {
    sendSetPasswordInvite.mockRejectedValue(new Error('Failed to send email'));

    await expect(service.sendSetPasswordInvite(inviteInput)).rejects.toThrow('Failed to send email');
  });
});
