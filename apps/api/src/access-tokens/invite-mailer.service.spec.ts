import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppEnv } from '../config/env.validation.js';
import type { EmailMessage } from '../email/email.types.js';
import { AccessTokenService } from './access-token.service.js';
import { InviteMailerService } from './invite-mailer.service.js';

const createConfigService = (): ConfigService<AppEnv, true> =>
  ({
    get: (key: keyof AppEnv) => {
      const values: AppEnv = {
        NODE_ENV: 'test',
        PORT: 4000,
        DATABASE_URL: 'postgresql://test',
        APP_URL: 'https://app.toonexpo.com',
        CORS_ORIGINS: ['https://app.toonexpo.com'],
        SESSION_TOKEN_PEPPER: 'test-session-token-pepper-32chars-min',
        SESSION_COOKIE_NAME: 'toonexpo_session',
        SESSION_IDLE_TTL_SECONDS: 3600,
        SESSION_ABSOLUTE_TTL_SECONDS: 7200,
        CSRF_SECRET: 'test-csrf-secret-at-least-32-chars!!',
        CSRF_COOKIE_NAME: 'toonexpo_csrf',
      };
      return values[key];
    },
  }) as ConfigService<AppEnv, true>;

describe('InviteMailerService', () => {
  const issueSetPasswordToken = vi.fn();
  const issuePasswordResetToken = vi.fn();
  const send = vi.fn();
  let service: InviteMailerService;

  beforeEach(() => {
    issueSetPasswordToken.mockReset();
    issuePasswordResetToken.mockReset();
    send.mockReset();

    const accessTokens = {
      issueSetPasswordToken,
      issuePasswordResetToken,
    } as unknown as AccessTokenService;

    service = new InviteMailerService(accessTokens, createConfigService(), { send });
  });

  it('emails a set-password link with the token in the URL fragment', async () => {
    issueSetPasswordToken.mockResolvedValue({ rawToken: 'invite-token-abc' });
    send.mockResolvedValue(undefined);

    await service.sendSetPasswordInvite({
      userId: 'user_1',
      email: 'admin@example.com',
      name: 'Admin',
      locale: 'hy',
    });

    expect(send).toHaveBeenCalledOnce();
    const message = send.mock.calls[0]?.[0] as EmailMessage;
    expect(message.text).toContain(
      'https://app.toonexpo.com/hy/auth/set-password#token=invite-token-abc',
    );
    expect(message.text).not.toContain('?token=');
  });

  it('emails a password-reset link with the token in the URL fragment', async () => {
    issuePasswordResetToken.mockResolvedValue({ rawToken: 'reset+token=xyz' });
    send.mockResolvedValue(undefined);

    await service.sendPasswordReset({
      userId: 'user_2',
      email: 'buyer@example.com',
      name: 'Buyer',
    });

    expect(send).toHaveBeenCalledOnce();
    const message = send.mock.calls[0]?.[0] as EmailMessage;
    expect(message.text).toContain(
      'https://app.toonexpo.com/hy/auth/set-password#token=reset%2Btoken%3Dxyz',
    );
    expect(message.text).not.toContain('?token=');
  });
});
