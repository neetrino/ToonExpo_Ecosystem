import { Injectable } from '@nestjs/common';
import {
  buyerRegisterSchema,
  loginSchema,
  type AuthSession,
  type BuyerRegisterInput,
  type LoginInput,
} from '@toonexpo/contracts';
import { Prisma } from '@toonexpo/db';

import { type PrismaService } from '../../common/prisma.service';
import { hashPassword, verifyPassword } from './password';
import { type SessionService } from './session.service';

const UNIQUE_CONSTRAINT_ERROR = 'P2002';

export type AuthMutationSuccess = {
  ok: true;
  session: AuthSession;
  sessionToken: string;
};

export type AuthMutationFailure = {
  ok: false;
  code: 'VALIDATION_ERROR' | 'INVALID_CREDENTIALS' | 'EMAIL_TAKEN';
};

export type AuthMutationResult = AuthMutationSuccess | AuthMutationFailure;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionService,
  ) {}

  async login(raw: unknown): Promise<AuthMutationResult> {
    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, code: 'VALIDATION_ERROR' };
    }
    return this.authenticate(parsed.data);
  }

  async register(raw: unknown): Promise<AuthMutationResult> {
    const parsed = buyerRegisterSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, code: 'VALIDATION_ERROR' };
    }

    const created = await this.createBuyer(parsed.data);
    if (!created.ok) {
      return created;
    }

    return this.authenticate({
      email: parsed.data.email,
      password: parsed.data.password,
    });
  }

  async logout(sessionToken: string | undefined): Promise<void> {
    if (!sessionToken) {
      return;
    }
    await this.sessions.deleteSession(sessionToken);
  }

  async me(sessionToken: string | undefined): Promise<AuthSession | null> {
    return this.sessions.resolveSession(sessionToken);
  }

  private async authenticate(input: LoginInput): Promise<AuthMutationResult> {
    const user = await this.prisma.client.user.findUnique({
      where: { email: input.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        passwordHash: true,
      },
    });

    if (!user?.passwordHash) {
      return { ok: false, code: 'INVALID_CREDENTIALS' };
    }

    const valid = await verifyPassword(user.passwordHash, input.password);
    if (!valid) {
      return { ok: false, code: 'INVALID_CREDENTIALS' };
    }

    const { sessionToken, expires } = await this.sessions.createSession(user.id);
    return {
      ok: true,
      sessionToken,
      session: {
        user: this.sessions.toAuthUser(user),
        expires: expires.toISOString(),
      },
    };
  }

  private async createBuyer(
    input: BuyerRegisterInput,
  ): Promise<{ ok: true } | AuthMutationFailure> {
    const passwordHash = await hashPassword(input.password);

    try {
      const user = await this.prisma.client.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            email: input.email.toLowerCase(),
            name: input.name,
            phone: input.phone,
            passwordHash,
            role: 'BUYER',
          },
          select: { id: true },
        });
        await tx.buyerProfile.create({ data: { userId: created.id } });
        return created;
      });

      await this.sessions.ensureBuyerQr(user.id);
      return { ok: true };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_ERROR
      ) {
        return { ok: false, code: 'EMAIL_TAKEN' };
      }
      throw error;
    }
  }
}
