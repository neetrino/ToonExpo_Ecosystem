import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CHANGE_PASSWORD_ERROR_CODES } from '@toonexpo/contracts';
import { UserStatus } from '@toonexpo/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '../prisma/prisma.service.js';
import { AuthPasswordService } from './auth-password.service.js';
import type { AuthUserResponseService } from './auth-user-response.service.js';
import type { SessionCookieService } from './session-cookie.service.js';
import * as passwordUtil from './utils/password.util.js';
import type { AuthenticatedUser } from './types/authenticated-user.js';

describe('AuthPasswordService.changePassword', () => {
  const userFindUnique = vi.fn();
  const userUpdate = vi.fn();
  const sessionUpdateMany = vi.fn();
  const transaction = vi.fn();

  let service: AuthPasswordService;

  const authUser: AuthenticatedUser = {
    id: 'user_1',
    name: 'Ani',
    email: 'ani@example.com',
    phone: '+37491111222',
    accountType: 'buyer',
    status: 'active',
    defaultLocale: null,
    createdAt: new Date('2026-07-18T00:00:00.000Z'),
    updatedAt: new Date('2026-07-18T00:00:00.000Z'),
    sessionId: 'session_current',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    userFindUnique.mockReset();
    userUpdate.mockReset();
    sessionUpdateMany.mockReset();
    transaction.mockReset();

    const prisma = {
      db: {
        user: { findUnique: userFindUnique, update: userUpdate },
        session: { updateMany: sessionUpdateMany },
        $transaction: transaction,
      },
    } as unknown as PrismaService;

    service = new AuthPasswordService(
      prisma,
      {} as import('../access-tokens/access-token.service.js').AccessTokenService,
      {} as import('../access-tokens/invite-mailer.service.js').InviteMailerService,
      {} as SessionCookieService,
      {} as AuthUserResponseService,
    );
  });

  it('updates the hash and revokes other sessions on success', async () => {
    const currentHash = await passwordUtil.hashPassword('OldPass123!');
    userFindUnique.mockResolvedValue({
      passwordHash: currentHash,
      status: UserStatus.active,
    });
    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        user: { update: userUpdate },
        session: { updateMany: sessionUpdateMany },
      }),
    );

    const hashSpy = vi.spyOn(passwordUtil, 'hashPassword');

    const result = await service.changePassword(authUser, {
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass456!',
    });

    expect(hashSpy).toHaveBeenCalledWith('NewPass456!');
    expect(userUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user_1' },
        data: expect.objectContaining({ passwordHash: expect.any(String) }),
      }),
    );
    expect(sessionUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user_1',
          revokedAt: null,
          id: { not: 'session_current' },
        }),
        data: { revokedAt: expect.any(Date) },
      }),
    );
    expect(result.message).toBe('Password changed successfully');
  });

  it('rejects an incorrect current password with a distinct code', async () => {
    const currentHash = await passwordUtil.hashPassword('OldPass123!');
    userFindUnique.mockResolvedValue({
      passwordHash: currentHash,
      status: UserStatus.active,
    });

    await expect(
      service.changePassword(authUser, {
        currentPassword: 'WrongPass123!',
        newPassword: 'NewPass456!',
      }),
    ).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as Record<string, unknown>;
      expect(response['code']).toBe(CHANGE_PASSWORD_ERROR_CODES.INVALID_CURRENT_PASSWORD);
      return true;
    });

    expect(transaction).not.toHaveBeenCalled();
  });

  it('rejects when new password equals current password', async () => {
    const currentHash = await passwordUtil.hashPassword('SamePass123!');
    userFindUnique.mockResolvedValue({
      passwordHash: currentHash,
      status: UserStatus.active,
    });

    await expect(
      service.changePassword(authUser, {
        currentPassword: 'SamePass123!',
        newPassword: 'SamePass123!',
      }),
    ).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as Record<string, unknown>;
      expect(response['code']).toBe(CHANGE_PASSWORD_ERROR_CODES.SAME_AS_CURRENT);
      return true;
    });

    expect(transaction).not.toHaveBeenCalled();
  });

  it('rejects invited users without a password hash', async () => {
    userFindUnique.mockResolvedValue({
      passwordHash: null,
      status: UserStatus.active,
    });

    await expect(
      service.changePassword(authUser, {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass456!',
      }),
    ).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as Record<string, unknown>;
      expect(response['code']).toBe(CHANGE_PASSWORD_ERROR_CODES.NO_PASSWORD_SET);
      return true;
    });
  });

  it('requires an active authenticated user record', async () => {
    userFindUnique.mockResolvedValue(null);

    await expect(
      service.changePassword(authUser, {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass456!',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
