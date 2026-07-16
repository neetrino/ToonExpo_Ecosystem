import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loadWebEnv, getResendClient } = vi.hoisted(() => ({
  loadWebEnv: vi.fn(),
  getResendClient: vi.fn(),
}));

vi.mock('@/lib/env', () => ({ loadWebEnv }));
vi.mock('./resend-client', () => ({ getResendClient }));

import { sendAccountInviteEmail } from './send-invite-email';

const PARAMS = { to: 'invitee@example.com', name: 'Jane', inviteUrl: 'https://app/invite/xyz' };

describe('sendAccountInviteEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips sending when Resend is unset (client null)', async () => {
    getResendClient.mockReturnValue(null);
    loadWebEnv.mockReturnValue({ RESEND_FROM_EMAIL: undefined });

    await expect(sendAccountInviteEmail(PARAMS)).resolves.toEqual({ sent: false });
  });

  it('skips sending when RESEND_FROM_EMAIL is unset', async () => {
    getResendClient.mockReturnValue({ emails: { send: vi.fn() } });
    loadWebEnv.mockReturnValue({ RESEND_FROM_EMAIL: undefined });

    await expect(sendAccountInviteEmail(PARAMS)).resolves.toEqual({ sent: false });
  });

  it('sends via Resend when configured', async () => {
    const send = vi.fn().mockResolvedValue({ data: { id: 'email-1' }, error: null });
    getResendClient.mockReturnValue({ emails: { send } });
    loadWebEnv.mockReturnValue({ RESEND_FROM_EMAIL: 'noreply@toonexpo.com' });

    await expect(sendAccountInviteEmail(PARAMS)).resolves.toEqual({ sent: true });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'noreply@toonexpo.com', to: PARAMS.to }),
    );
  });

  it('returns sent:false when Resend rejects the send', async () => {
    const send = vi.fn().mockResolvedValue({ data: null, error: { message: 'bad request' } });
    getResendClient.mockReturnValue({ emails: { send } });
    loadWebEnv.mockReturnValue({ RESEND_FROM_EMAIL: 'noreply@toonexpo.com' });

    await expect(sendAccountInviteEmail(PARAMS)).resolves.toEqual({ sent: false });
  });

  it('returns sent:false when the send call throws', async () => {
    const send = vi.fn().mockRejectedValue(new Error('network error'));
    getResendClient.mockReturnValue({ emails: { send } });
    loadWebEnv.mockReturnValue({ RESEND_FROM_EMAIL: 'noreply@toonexpo.com' });

    await expect(sendAccountInviteEmail(PARAMS)).resolves.toEqual({ sent: false });
  });
});
