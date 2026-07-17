import { Inject, Injectable } from '@nestjs/common';
import { setPasswordSchema } from '@toonexpo/contracts';

import { hashInviteToken, parseInviteUserId } from '../../common/invite/invite-token';
import { PrismaService } from '../../common/prisma.service';
import { hashPassword } from './password';

export type InviteResult = { ok: true } | { ok: false; code: 'INVALID_INVITE' };
export type SetPasswordResult =
  | { ok: true }
  | { ok: false; code: 'VALIDATION_ERROR' | 'INVALID_INVITE' };

class InvalidInviteError extends Error {}

@Injectable()
export class AccountInviteService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async preview(rawToken: string): Promise<InviteResult> {
    const record = await this.prisma.client.verificationToken.findUnique({
      where: { token: hashInviteToken(rawToken) },
      select: { identifier: true, expires: true },
    });
    return isValidInviteRecord(record)
      ? { ok: true }
      : { ok: false, code: 'INVALID_INVITE' };
  }

  async setPassword(raw: unknown): Promise<SetPasswordResult> {
    const parsed = setPasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, code: 'VALIDATION_ERROR' };
    }

    const passwordHash = await hashPassword(parsed.data.password);
    return this.consume(parsed.data.token, passwordHash);
  }

  private async consume(rawToken: string, passwordHash: string): Promise<InviteResult> {
    const tokenHash = hashInviteToken(rawToken);
    try {
      await this.prisma.client.$transaction(async (tx) => {
        const record = await tx.verificationToken.findUnique({
          where: { token: tokenHash },
          select: { identifier: true, expires: true },
        });
        const userId = record && isValidInviteRecord(record)
          ? parseInviteUserId(record.identifier)
          : null;
        if (!userId) {
          throw new InvalidInviteError();
        }

        await tx.verificationToken.delete({ where: { token: tokenHash } });
        await tx.user.update({ where: { id: userId }, data: { passwordHash } });
      });
      return { ok: true };
    } catch (error) {
      if (error instanceof InvalidInviteError) {
        return { ok: false, code: 'INVALID_INVITE' };
      }
      throw error;
    }
  }
}

function isValidInviteRecord(
  record: { identifier: string; expires: Date } | null,
): record is { identifier: string; expires: Date } {
  return record !== null && record.expires.getTime() > Date.now();
}
