import { createHash, randomBytes, randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import type { AuthSession, AuthUser } from '@toonexpo/contracts';
import type { PlatformRole } from '@toonexpo/domain';

import { PrismaService } from '../../common/prisma.service';
import { SESSION_MAX_AGE_SECONDS } from './auth.constants';

const MS_PER_SECOND = 1000;
const QR_TOKEN_BYTE_LENGTH = 32;

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: PlatformRole;
};

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  toAuthUser(user: UserRow): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    };
  }

  async createSession(userId: string): Promise<{ sessionToken: string; expires: Date }> {
    const sessionToken = randomUUID();
    const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * MS_PER_SECOND);
    await this.prisma.client.session.create({
      data: { sessionToken, userId, expires },
    });
    return { sessionToken, expires };
  }

  async deleteSession(sessionToken: string): Promise<void> {
    await this.prisma.client.session.deleteMany({ where: { sessionToken } });
  }

  async resolveSession(sessionToken: string | undefined): Promise<AuthSession | null> {
    if (!sessionToken) {
      return null;
    }

    const row = await this.prisma.client.session.findUnique({
      where: { sessionToken },
      select: {
        expires: true,
        user: {
          select: { id: true, email: true, name: true, image: true, role: true },
        },
      },
    });

    if (!row || row.expires.getTime() <= Date.now()) {
      if (row) {
        await this.deleteSession(sessionToken);
      }
      return null;
    }

    return {
      user: this.toAuthUser(row.user),
      expires: row.expires.toISOString(),
    };
  }

  /** Idempotent get-or-create of an active buyer QR after registration. */
  async ensureBuyerQr(userId: string): Promise<void> {
    await this.prisma.client.$transaction(async (tx) => {
      let profile = await tx.buyerProfile.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!profile) {
        profile = await tx.buyerProfile.create({
          data: { userId },
          select: { id: true },
        });
      }

      const existing = await tx.qrCode.findUnique({
        where: { buyerProfileId: profile.id },
        select: { id: true },
      });
      if (existing) {
        return;
      }

      const token = randomBytes(QR_TOKEN_BYTE_LENGTH).toString('base64url');
      const tokenHash = createHash('sha256').update(token, 'utf8').digest('hex');
      await tx.qrCode.create({
        data: { buyerProfileId: profile.id, token, tokenHash },
      });
    });
  }
}
