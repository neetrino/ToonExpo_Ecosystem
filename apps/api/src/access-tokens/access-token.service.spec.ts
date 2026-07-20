import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccountAccessTokenPurpose, AccountType, UserStatus } from '@toonexpo/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppEnv } from '../config/env.validation.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { AccessTokenService } from './access-token.service.js';
import { hashAccessToken } from './access-token.util.js';

const PEPPER = 'test-session-token-pepper-32chars-min';

const createConfigService = (): ConfigService<AppEnv, true> =>
  ({
    get: (key: keyof AppEnv) => {
      const values: AppEnv = {
        NODE_ENV: 'test',
        PORT: 4000,
        DATABASE_URL: 'postgresql://test',
        APP_URL: 'http://localhost:3000',
        CORS_ORIGINS: ['http://localhost:3000'],
        SESSION_TOKEN_PEPPER: PEPPER,
        SESSION_COOKIE_NAME: 'toonexpo_session',
        SESSION_IDLE_TTL_SECONDS: 3600,
        SESSION_ABSOLUTE_TTL_SECONDS: 7200,
        CSRF_SECRET: 'test-csrf-secret-at-least-32-chars!!',
        CSRF_COOKIE_NAME: 'toonexpo_csrf',
      };
      return values[key];
    },
  }) as ConfigService<AppEnv, true>;

describe('AccessTokenService', () => {
  const updateMany = vi.fn();
  const create = vi.fn();
  const findUnique = vi.fn();
  const update = vi.fn();
  let service: AccessTokenService;

  beforeEach(() => {
    updateMany.mockReset();
    create.mockReset();
    findUnique.mockReset();
    update.mockReset();

    const prisma = {
      db: {
        accountAccessToken: {
          updateMany,
          create,
          findUnique,
          update,
        },
      },
    } as unknown as PrismaService;

    service = new AccessTokenService(prisma, createConfigService());
  });

  it('issues a set-password token after invalidating unused ones', async () => {
    updateMany.mockResolvedValue({ count: 1 });
    create.mockResolvedValue({ id: 'tok_1' });

    const issued = await service.issueSetPasswordToken('user_1');

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user_1',
          purpose: AccountAccessTokenPurpose.set_password,
          usedAt: null,
        }),
      }),
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user_1',
          purpose: AccountAccessTokenPurpose.set_password,
          tokenHash: hashAccessToken(issued.rawToken, PEPPER),
        }),
      }),
    );
    expect(issued.rawToken.length).toBeGreaterThan(16);
  });

  it('issues a password-reset token with reset purpose', async () => {
    updateMany.mockResolvedValue({ count: 0 });
    create.mockResolvedValue({ id: 'tok_reset' });

    const issued = await service.issuePasswordResetToken('user_1');

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          purpose: AccountAccessTokenPurpose.password_reset,
        }),
      }),
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          purpose: AccountAccessTokenPurpose.password_reset,
        }),
      }),
    );
    expect(issued.rawToken.length).toBeGreaterThan(16);
  });

  it('rejects used or expired tokens', async () => {
    findUnique.mockResolvedValue({
      id: 'tok_1',
      purpose: AccountAccessTokenPurpose.set_password,
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: 'user_1',
        status: UserStatus.invited,
        accountType: AccountType.company_member,
      },
    });

    await expect(service.validateSetPasswordToken('raw-token-value-here')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('accepts a valid unused set-password token', async () => {
    const rawToken = 'valid-raw-token-value-32bytes!!';
    findUnique.mockResolvedValue({
      id: 'tok_1',
      purpose: AccountAccessTokenPurpose.set_password,
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: 'user_1',
        status: UserStatus.invited,
        accountType: AccountType.company_member,
      },
    });

    const result = await service.validateSetPasswordToken(rawToken);

    expect(findUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashAccessToken(rawToken, PEPPER) },
      include: { user: true },
    });
    expect(result.token.id).toBe('tok_1');
  });

  it('accepts a valid unused password-reset token', async () => {
    const rawToken = 'valid-reset-token-value-32bytes!';
    findUnique.mockResolvedValue({
      id: 'tok_reset',
      purpose: AccountAccessTokenPurpose.password_reset,
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: 'user_1',
        status: UserStatus.active,
        accountType: AccountType.buyer,
      },
    });

    const result = await service.validateSetPasswordToken(rawToken);

    expect(result.token.purpose).toBe(AccountAccessTokenPurpose.password_reset);
    expect(result.token.id).toBe('tok_reset');
  });
});
